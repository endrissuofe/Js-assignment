// ## My answers
// Part A write-up, with screenshots and evidence, is in README.md

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const port = 4555;


app.use(express.json());


const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/techSchoolApp");
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
}

databaseConnection();


app.get("/", (req, res) => {
  res.send("Hello World");
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  // unique is NOT a validator. It tells MongoDB to build a unique index on this
  // field. Mongoose does not check it before saving - the database rejects the
  // duplicate at write time and throws an error with code 11000. That is why the
  // create route handles 11000 separately from a ValidationError.
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  // minlength is a real validator. It runs on save(), and on update only when
  // runValidators: true is passed (see the PATCH route below).
  course: { type: String, minlength: 3 },
  institution: String
});

const Student = mongoose.model("Student", studentSchema);


// Maps an error thrown by Mongoose or MongoDB onto the right HTTP status.
// Three failures that are NOT server faults get their own codes:
//   CastError       - the id could not be cast to an ObjectId (bad client input) -> 400
//   ValidationError - a schema validator rejected a value (bad client input)     -> 400
//   code 11000      - MongoDB rejected a duplicate key against a unique index    -> 409
// Anything else is a genuine server problem and stays 500.
const handleError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({ message: `Invalid id: ${error.value}` });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "A student with that email already exists" });
  }
  console.log("Unexpected error:", error);
  return res.status(500).json({ message: "Internal server error" });
};


app.post("/create-student", async (req, res) => {
  try {
    // This destructuring used to sit OUTSIDE the try block. When a client sent the
    // wrong Content-Type, express.json() left req.body unset and this line threw a
    // TypeError that the catch below could never see, so it escaped to Express and
    // returned an HTML stack trace instead of JSON. Moving it inside fixes that.
    const { name, age, email, phone, address, course, institution } = req.body;

    const student = new Student({ name, age, email, phone, address, course, institution });
    await student.save();

    // 201 Created, not 200. A new resource was created, and 201 says so.
    return res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.get("/get-students", async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json({ message: "Students fetched successfully", students });
  } catch (error) {
    return handleError(res, error);
  }
});


app.get("/get-student/:id", async (req, res) => {
  const { id } = req.params;

  // isValid only checks the SHAPE of the string, not whether the document exists.
  // Its limitation: it accepts any 12-byte value, which includes any 24-character
  // hex string AND any plain 12-character string. So "aaaaaaaaaaaaaaaaaaaaaaaa"
  // passes isValid and then finds nothing. That is why the 404 check below is
  // still needed - isValid rules out malformed input, it does not promise the
  // student is there.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid id: ${id} is not a valid ObjectId` });
  }

  try {
    const student = await Student.findById(id);

    // findById returns null when nothing matched. The query succeeded, so nothing
    // is thrown - without this check the route would send 200 with student: null.
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student fetched successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.put("/update-student/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, email, phone, address, course, institution } = req.body;
  try {
    const student = await Student.findByIdAndUpdate(id, { name, age, email, phone, address, course, institution }, { new: true });
    return res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.get('/get-student-by-name', async (req, res) => {
  const { name } = req.query;
  try {
    const student = await Student.find({ name });
    return res.status(200).json({ message: "Student fetched successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.get("/search-students", async (req, res) => {
  const { q } = req.query;

  // Reject a missing or blank q instead of returning the whole collection.
  // A search box that silently dumps every record is useless and gets slower
  // as the database grows.
  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "A search term is required. Use ?q=yourSearchTerm" });
  }

  const term = q.trim();

  // Escape regex metacharacters before using user input as a pattern.
  // Without this a search for ".*" would match every student, and a stray "("
  // would throw an invalid-regex error and return a 500.
  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    // $regex with $options "i" makes MongoDB do the case-insensitive matching.
    // $or applies it across the three fields. The work stays in the database -
    // nothing is fetched into Node and filtered there.
    const students = await Student.find({
      $or: [
        { name:   { $regex: safeTerm, $options: "i" } },
        { email:  { $regex: safeTerm, $options: "i" } },
        { course: { $regex: safeTerm, $options: "i" } }
      ]
    });

    // 200 with an empty array when nothing matches, not 404. The search itself
    // succeeded - "no students match this term" is a valid result, not a missing
    // resource. 404 would mean the /search-students endpoint does not exist.
    // Clients can then always expect an array and just check its length.
    return res.status(200).json({ message: "Search completed successfully", students });
  } catch (error) {
    return handleError(res, error);
  }
});


app.patch("/students/:id/course", async (req, res) => {
  const { id } = req.params;
  const { course } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid id: ${id} is not a valid ObjectId` });
  }

  if (!course || course.trim() === "") {
    return res.status(400).json({ message: "A course value is required" });
  }

  try {
    // Only course is in the update object, so this changes one field rather than
    // replacing the whole document the way the PUT route does.
    const student = await Student.findByIdAndUpdate(
      id,
      { course: course.trim() },
      {
        // new: true returns the document AFTER the update. Without it the default
        // is new: false, which returns the document as it was BEFORE - so the
        // response would show the old course even though the database had changed.
        new: true,
        // runValidators defaults to FALSE on findByIdAndUpdate. Schema validators
        // run on save() but are skipped on update unless this is switched on. With
        // it off, a 1-character course would be written straight past the
        // minlength: 3 rule. With it on, Mongoose throws a ValidationError, which
        // handleError maps to 400 - a client error, not a 500 server error.
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Course updated successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.delete("/delete-student/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid id: ${id} is not a valid ObjectId` });
  }

  try {
    // findByIdAndDelete returns the deleted document, or null if nothing matched.
    // The original code discarded this value, which is why deleting a student who
    // was never in the database still reported success.
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Returning 200 with a body rather than 204. 204 means "success, no content"
    // and must be sent with an empty body, so the client would get no confirmation
    // of what was removed. 200 lets us return the deleted student, which is more
    // useful to the admin and makes the delete verifiable.
    return res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    return handleError(res, error);
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

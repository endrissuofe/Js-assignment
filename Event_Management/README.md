# EventHorizon Auth API

The user accounts backend for **EventHorizon**, a platform for managing local tech meetups. It handles sign-up, email verification, login and protected routes.

Built with **Node.js, Express, MongoDB (Mongoose), Joi, bcrypt, JWT and Nodemailer**.

## Features

- **Registration** with Joi validation. Passwords need at least 8 characters with at least one letter and one number, and are hashed with bcrypt before saving.
- **Email verification by link** (no OTP codes). Each new user gets a random, time-limited token, and only a SHA-256 hash of it is stored in the database.
- **Login** returns a JSON Web Token (JWT). Unverified users can't log in.
- **Protected route** (`/api/user/profile`) that requires a valid JWT from a verified user.
- **Consistent errors.** Every error returns `{ success: false, message }` with the right HTTP status code.

## Project structure

```
Event_Management/
├── docs/
│   └── EventHorizon.postman_collection.json   # ready-made API requests
├── src/
│   ├── config/
│   │   ├── env.js          # loads .env and checks required settings
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js   # register, verify email, resend, login
│   │   └── user.controller.js   # profile
│   ├── middleware/
│   │   ├── auth.js          # checks the JWT (protects routes)
│   │   ├── validate.js      # runs Joi validation before a controller
│   │   └── errorHandler.js  # 404 + one place that formats all errors
│   ├── models/User.js       # user schema
│   ├── routes/              # URL → middleware → controller
│   ├── utils/               # token helpers, email sender, ApiError
│   ├── validators/          # Joi rules
│   ├── app.js               # Express app setup
│   └── server.js            # starts the server
├── .env.example             # template for your .env file
└── package.json
```

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- MongoDB, either installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Install

```bash
git clone https://github.com/endrissuofe/Js-assignment.git
cd Js-assignment/Event_Management
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

| Variable | Required | What it is | Example |
|---|---|---|---|
| `PORT` | No | Port the API runs on | `5000` |
| `NODE_ENV` | No | `development` or `production` | `development` |
| `MONGO_URI` | **Yes** | MongoDB connection string | `mongodb://127.0.0.1:27017/eventhorizon` |
| `JWT_SECRET` | **Yes** | Long random string used to sign login tokens | see the tip below |
| `JWT_EXPIRES_IN` | No | How long a login lasts | `1h` |
| `FRONTEND_URL` | No | Frontend address, used in the verification link | `http://localhost:3000` |
| `VERIFICATION_TOKEN_EXPIRES_MINUTES` | No | How long the email link stays valid | `60` |
| `SMTP_HOST` | For email | Mail server | `smtp.gmail.com` |
| `SMTP_PORT` | For email | Mail server port | `587` |
| `SMTP_USER` | For email | Email account used to send mail | `you@gmail.com` |
| `SMTP_PASS` | For email | App password for that account | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | No | Sender name and address | `"EventHorizon <you@gmail.com>"` |

**Tip:** generate a strong `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**No email account yet?** Leave the SMTP values as they are. The API will print each verification email, including the link, in the terminal, so you can still test the whole flow.

**Using Gmail?** Turn on 2-Step Verification, then create an app password at <https://myaccount.google.com/apppasswords> and use it as `SMTP_PASS`.

> `.env` is listed in `.gitignore` and must never be committed.

### 4. Run

```bash
npm run dev    # development (restarts on file changes)
npm start      # production
```

You should see:
```
MongoDB connected: 127.0.0.1
EventHorizon API running on http://localhost:5000 (development)
```

Check it's up: <http://localhost:5000/api/health>

## API endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | API status check |
| POST | `/auth/register` | – | Create an account and send the verification email |
| GET | `/auth/verify-email?token=…` | – | Verify the email address |
| POST | `/auth/resend-verification` | – | Send a new verification link |
| POST | `/auth/login` | – | Log in and receive a JWT |
| GET | `/user/profile` | Bearer JWT | Get the logged-in user's profile |

### POST `/auth/register`

```json
{ "name": "Drix", "email": "drix@example.com", "password": "secret123" }
```

**201 Created**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": { "id": "…", "name": "Drix", "email": "drix@example.com", "isVerified": false }
}
```

### GET `/auth/verify-email?token=<token from email>`

**200 OK**
```json
{ "success": true, "message": "Email verified successfully. You can now log in." }
```

### POST `/auth/resend-verification`

```json
{ "email": "drix@example.com" }
```

**200 OK.** The reply is the same whether or not the email exists, so this endpoint can't be used to find out who has an account.

### POST `/auth/login`

```json
{ "email": "drix@example.com", "password": "secret123" }
```

**200 OK**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs…",
  "user": { "id": "…", "name": "Drix", "email": "drix@example.com" }
}
```

### GET `/user/profile`

Header: `Authorization: Bearer <token>`

**200 OK**
```json
{
  "success": true,
  "user": { "id": "…", "name": "Drix", "email": "drix@example.com", "isVerified": true, "createdAt": "…" }
}
```

## Error responses

All errors have the same shape:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "password", "message": "Password must be at least 8 characters long" }] }
```

(`errors` only appears for validation failures.)

| Status | When |
|---|---|
| 400 | Invalid input, or a verification link that is missing, invalid or expired |
| 401 | Wrong email/password, or a missing, invalid or expired JWT |
| 403 | Email not verified yet |
| 404 | Route doesn't exist |
| 409 | Email already registered |
| 500 | Unexpected server error, or the email failed to send |

## Security notes

- **Passwords** are hashed with bcrypt (10 salt rounds) and never returned by the API.
- **Verification tokens** are 32 random bytes. Only their SHA-256 hash is stored, they expire after 60 minutes by default, and each works only once.
- **JWTs** are signed with HS256 and only HS256 is accepted, which blocks algorithm-swap attacks. They expire after 1 hour by default and only contain the user id.
- **Login errors** say "Invalid email or password" in both cases, so attackers can't tell which emails are registered.
- **Other protections:** Helmet sets secure HTTP headers, CORS only allows `FRONTEND_URL`, and request bodies are limited to 10 KB.

## Testing with Postman

1. Open Postman → **Import** → select `docs/EventHorizon.postman_collection.json`.
2. Run **Register**.
3. Copy the `token=` value from the verification email (or from the terminal), paste it into the collection variable `verifyToken`, and run **Verify Email**.
4. Run **Login**. The JWT is saved into the `token` variable automatically.
5. Run **Get Profile**.

The collection also includes requests for the common failure cases (duplicate email, weak password, unverified login, missing token).

## Author

**Suofe Endris (Drix)**, Lagos, Nigeria

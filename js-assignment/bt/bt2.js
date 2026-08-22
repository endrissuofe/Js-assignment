const bunnies = ['Lucy', 'Tom', 'Molly', 'Bella', 'Mario', 'Luigi'];

console.log("Using for loop:");
for (let i = 0; i < bunnies.length; i++) {
  if (bunnies[i].length > 4) {
    console.log(bunnies[i]);
  }
}

console.log("Using while loop:");
let index = 0;
while (index < bunnies.length) {
  if (bunnies[index].length > 4) {
    console.log(bunnies[index]);
  }
  index++;
}

console.log("Both loops printed the same names.");

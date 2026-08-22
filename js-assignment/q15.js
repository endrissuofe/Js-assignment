const nestedArrays = [
  ['Lucy', 'Tom'],
  ['Molly', 'Bella'],
];

console.log(nestedArrays[0][0]);
console.log(nestedArrays[1][1]);

for (const nestedArray of nestedArrays) {
  for (const name of nestedArray) {
    console.log(name);
  }
}

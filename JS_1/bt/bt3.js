const nestedArrays = [
  ['Lucy', 'Tom'],
  ['Molly', 'Bella'],
  ['Mario', 'Luigi'],
];

let count = 1;
for (const innerArray of nestedArrays) {
  for (const name of innerArray) {
    console.log(`${count}. ${name}`);
    count++;
  }
}

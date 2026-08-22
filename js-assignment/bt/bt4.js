const bunnies = [
  { name: 'Lucy', isHappy: true },
  { name: 'Tom', isHappy: false },
  { name: 'Molly', isHappy: true },
];

function countHappyBunnies(bunnies) {
  let happyCount = 0;
  for (const bunny of bunnies) {
    if (bunny.isHappy) {
      happyCount++;
    }
  }
  return happyCount;
}

console.log("Number of happy bunnies:", countHappyBunnies(bunnies));

const happyCount = countHappyBunnies(bunnies);

const message = happyCount >= bunnies.length / 2
    ? 'Most bunnies are happy'
    : 'Most bunnies are not happy';

console.log(message);

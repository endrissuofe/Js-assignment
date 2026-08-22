// Anonymous function
const sumBunniesAnonymous = function(blackBunnies, whiteBunnies) {
  return blackBunnies + whiteBunnies;
};

// Arrow function
const sumBunniesArrow = (blackBunnies, whiteBunnies) => blackBunnies + whiteBunnies;

console.log("Total bunnies (Anonymous, 10, 20):", sumBunniesAnonymous(10, 20));
console.log("Total bunnies (Arrow, 7, 3):", sumBunniesArrow(7, 3));

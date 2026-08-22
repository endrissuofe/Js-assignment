let bunnies = ['Lucy', 'Tom', 'Molly', 'Bella', 'Max', 'Charlie'];

// Add Mario to the end
bunnies.push('Mario');
bunnies.unshift('Luigi');
bunnies.splice(bunnies.indexOf('Lucy'), 1);

console.log("Final bunnies array:", bunnies);

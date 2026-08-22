let bunnyHealth = 'healthy';

if (bunnyHealth === 'healthy') {
    console.log("The bunny is healthy.");
} else if (bunnyHealth === 'sick') {
    console.log("The bunny is sick.");
} else {
    console.log("The bunny's health status is unknown.");
}

switch (bunnyHealth) {
    case 'healthy':
        console.log("The bunny is healthy.");
        break;
    case 'sick':
        console.log("The bunny is sick.");
        break;
    default:
        console.log("The bunny's health status is unknown.");
}

bunnyHealth === 'healthy'
    ? console.log("The bunny is healthy.")
    : console.log("The bunny's health status is unknown.");

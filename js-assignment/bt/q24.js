function sumBunnies(blackBunnies, whiteBunnies) {
    if (typeof blackBunnies !== "number" || typeof whiteBunnies !== "number") {
        throw new Error("Both arguments must be numbers.");
    }
    return blackBunnies + whiteBunnies;
}

try {
    console.log(sumBunnies(10, 'twenty'));
} catch (error) {
    console.error("Error:", error.message);
}

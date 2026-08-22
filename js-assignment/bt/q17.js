let bunnyJSON = '{"name":"Lucy","age":3,"isHappy":true}';

let bunnyObject = JSON.parse(bunnyJSON);
console.log("Bunny's name:", bunnyObject.name);
console.log("Bunny's age:", bunnyObject.age);

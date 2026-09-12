var values = [3.14, 'Lucy',
             true, null,
             undefined, Symbol('Lucy'),
             { name: 'Lucy' },
             ['Lucy', 'Tom']];

values.forEach(value => {
  console.log("Value:", value, "Type:", typeof value);
});

const pug = require('pug');
// const compiledFunction = pug.compileFile('template.pug');
// console.log(compiledFunction)
// console.log(compiledFunction({
//     name: '李莉'
//   }));
var fn = pug.compileClient('string of pug', {});

console.log(fn)
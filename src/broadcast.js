const { resolve } = require("path")
const PythonShell = require('python-shell');
const pyshell = new PythonShell('broadcast.py');

pyshell.on('message', function (message) {
  console.log(message);
});
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fetch = require("node-fetch");

app.use(express.static(__dirname + '/public', {
  extensions: ['html']
})); // host static pages in public directory
app.use('/functions', require('./functions.js')); // use functions router

app.listen(port, () => {
  console.log(`Webserver has started!`);
});



// handle 404 - page not found
app.use(function(req, res, next) {
  res.status(404).end('Not Found!')
})

// handle errors
app.use(function(err, req, res, next) {
  console.log("Error: ", err.stack)
  res.status(500).end(`Error:\n${err.message}`)
})
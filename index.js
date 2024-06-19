const express = require('express');
const ErrorHandingMiddleware = require("./middleware/errorHandling.middleware");
const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));


// Routes will always go here 
app.use('/', require('./routes/urls'));

app.use(ErrorHandingMiddleware);

const port = process.env.PORT || 8000;
app.listen(port);

console.log(`Server started on port ${port}`);

module.exports = app;
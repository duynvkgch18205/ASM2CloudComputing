const express = require('express');
const engines = require('consolidate');
const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

app.use(express.static('public'));
app.get('/', function (req, res) {
res.sendFile(__dirname + '/product');
});

app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var productController = require('./product.js');
app.use('/product',productController);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Listening on ${ PORT }'));
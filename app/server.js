require('dotenv').config()

var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');


var db = require('./models');
const MONGODB = process.env.MONGODB;
const PORT = 3000;

var app = express();

// MIDDLEWARE
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// STATIC FILES
app.use(express.static('public'));

console.log(MONGODB);
mongoose.connect(MONGODB)

app.get('/scrape', async function (req, res) {
  let response = await axios.get('https://www.theonion.com/')
  // load response into scraper
  var $ = cheerio.load(response.data);
  $('.post-wrapper article h1').each(function (i, element) {
    let result = {};
    result.title = $(this)
      .children("a")
      .text();

    result.link = $(this)
      .children('a')
      .attr('href');

    db.Article.create(result)
      .then(function (dbArticle) {
        console.log(dbArticle);
      })
      .catch(err => {
        console.log(err);
      });
  });

  res.send("Scrape Complete");
});

app.listen(PORT, () => console.log("App running on port " + PORT + "!"));
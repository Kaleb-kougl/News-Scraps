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
app.use(express.static('./views/public'));

console.log(MONGODB);
mongoose.connect(MONGODB)

app.get('/scrape', async function (req, res) {
  let response = await axios.get('https://www.theonion.com/')
  // load response into scraper
  var $ = cheerio.load(response.data);
  $('.post-wrapper article').each(function (i, element) {
    let result = {};

    result.title = $(this)
      .find('a')
      .text()

    result.link = $(this)
      .find('a')
      .attr('href');

    result.excerpt = $(this)
      .find('.excerpt')
      .text();

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

app.get("/articles", function (req, res) {
  // grab all
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    //fill in with note data
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  // create new note
  db.Note.create(req.body)
    .then(function (dbNote) {
      // connect with article
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, () => console.log("App running on port " + PORT + "!"));
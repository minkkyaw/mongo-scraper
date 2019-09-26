const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const config = require("./config");

const PORT = process.env.PORT || 3000;

// Initialize Express
const path = require("path");
const app = express();

// app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const getScrapFromBestbuy = (searchInput, res) => {
  let url = `https://www.bestbuy.com/site/searchpage.jsp?_dyncharset=UTF-8&id=pcat17071&iht=y&keys=keys&ks=960&list=n&sc=Global&st=${searchInput}&type=page&usc=All%20Categories`;
  try {
    axios
      .get(url)
      .then(function(response) {
        let $ = cheerio.load(response.data);
        let result = new Array();
        $("li.sku-item").each(function(i, element) {
          let title = $(this)
            .find(".sku-header")
            .children("a")
            .text();
          let price = $(this)
            .find(".priceView-hero-price.priceView-customer-price")
            .find("span")
            .html();
          if (price) price = parseInt(price.replace("$<!-- -->", ""));
          else price = " - ";
          let imageUrl = $(this)
            .find(".product-image")
            .attr("src");
          let link =
            "https://www.bestbuy.com" +
            $(this)
              .find(".sku-header")
              .children("a")
              .attr("href");
          result.push(
            Object.assign(
              {},
              { category: searchInput, title, price, imageUrl, link }
            )
          );
        });
        return result;
      })
      .then(result => {
        result.map((item, i) => db.Item.create(item));
      })
      .then(() => res.json({ body: "Scrape Complete" }));
  } catch (err) {
    res.send(err);
  }
};

const MONGODB_URI = config.db || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", async (req, res) => {
  let items = await db.Item.find({ saveItem: false });
  if (items.length === 0) items = [{ noItem: true }];
  res.render("index", { items: items });
});

app.get("/home", async (req, res) => {
  let items = await db.Item.find({
    category: req.query.category,
    saveItem: false
  });
  if (items.length === 0) items = [{ noItem: true }];
  res.render("index", { items: items });
});

app.get("/saved", async (req, res) => {
  let items = await db.Item.find({ saveItem: true });
  if (items.length === 0) items = [{ noItem: true }];
  res.render("saved", { items: items });
});

app.get("/scrape", async (req, res) => {
  await db.Item.deleteMany({ category: req.query.searchInput });
  getScrapFromBestbuy(req.query.searchInput, res);
});

app.get("/items", async (req, res) => {
  const result = await db.Item.find({ category: req.query.searchInput });
  res.json(result);
});

app.put("/items/saved/:id/:boolean", async (req, res) => {
  const item = await db.Item.updateOne(
    { _id: req.params.id },
    { $set: { saveItem: req.params.boolean } }
  );
  res.json(item);
});

app.get("/items/:id", async (req, res) => {
  const item = await db.Item.findById(req.params.id);
  item.review = await db.Review.find()
    .where("_id")
    .in(item.review)
    .exec();
  res.json(item);
});

app.post("/items/:id", function(req, res) {
  db.Review.create(req.body)
    .then(function(reviewResult) {
      db.Item.findById(req.params.id).then(result => {
        result.review = [...result.review, reviewResult._id];
        result.save();
      });
    })
    .then(function(dbItem) {
      res.json(dbItem);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/items", async (req, res) => {
  const result = await db.Item.deleteMany(
    req.query.category || req.query.id
      ? {
          $or: [{ category: req.query.category }, { _id: req.query.id }]
        }
      : {}
  );
  res.json(result);
});

app.delete("/item/reviews/delete", async (req, res) => {
  const result = await db.Review.deleteOne(req.body);
  res.json(result);
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

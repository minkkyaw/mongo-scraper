var axios = require("axios");
var cheerio = require("cheerio");

const getScrapFromBestbuy = searchInput => {
  axios
    .get(
      `https://www.bestbuy.com/site/searchpage.jsp?_dyncharset=UTF-8&id=pcat17071&iht=y&keys=keys&ks=960&list=n&sc=Global&st=${searchInput}&type=page&usc=All%20Categories`
    )
    .then(function(response) {
      var $ = cheerio.load(response.data);
      var result = new Array();
      $("li.sku-item").each(function(i, element) {
        let title = $(this)
          .find(".sku-header")
          .children("a")
          .text();
        let price = $(this)
          .find(".priceView-hero-price.priceView-customer-price")
          .find("span")
          .html()
          .replace("$<!-- -->", "");
        let imageUrl = $(this)
          .find(".product-image")
          .attr("src");
        let link =
          "https://www.bestbuy.com" +
          $(this)
            .find(".sku-header")
            .children("a")
            .attr("href");
        result.push(Object.assign({}, { title, price, imageUrl, link }));
      });
      return result;
    });
};

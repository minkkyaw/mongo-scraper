let reviewContainerTemplate = `<div class="reviews-wrapper">
    <h3 class="review-item-title">{{%TITLE%}}</h3>
    <div class="review-wrapper">
      {%REVIEW%}
    </div>
    <div class="add-review-wrapper">
      <textarea class="review-input inherit" col="2" row="4"></textarea>
      <button data-id="{%ITEMID%}" class="btn add-review inherit">Add</button>
    </div>
  </div>`;

let reviewTemplate = `<div class="review">
        <p class="review-details">{%REVIEWBODY%}</p>
        <button data-review-id="{%REVIEWID%}" class="btn delete-review">X</button>
      </div>`;

document.querySelectorAll(".scrape-btn").forEach(scrapeBtn =>
  scrapeBtn.addEventListener("click", async e => {
    e.preventDefault();
    let searchInput = document.querySelector(".scrape-input").value;
    let url = `/scrape?searchInput=${searchInput}`;
    let result = await fetch(url);
    result = await result.json();
    alert("Successfully scraped");
  })
);

if (document.querySelectorAll(".search-btn"))
  document.querySelectorAll(".search-btn").forEach(searchBtn =>
    searchBtn.addEventListener("click", async e => {
      let searchInput = document.querySelector(".search-input").value;
      let url = `/home?category=${searchInput}`;
      window.location.href = url;
    })
  );

if (document.querySelectorAll(".delete-from-save-btn"))
  document.querySelectorAll(".delete-from-save-btn").forEach(deleteBtn =>
    deleteBtn.addEventListener("click", async e => {
      e.preventDefault();
      let id = e.target.dataset.id;
      let url = `/items/saved/${id}/false`;
      let result = await fetch(url, {
        method: "PUT"
      });
      result = await result.json();
      location.reload();
    })
  );

if (document.querySelectorAll(".save-item"))
  document.querySelectorAll(".save-item").forEach(saveItem =>
    saveItem.addEventListener("click", async e => {
      e.preventDefault();
      let id = e.target.dataset.id;
      let url = `/items/saved/${id}/true`;
      let result = await fetch(url, {
        method: "PUT"
      });
      result = await result.json();
      location.reload();
    })
  );

if (document.querySelectorAll(".add-review-btn"))
  document.querySelectorAll(".add-review-btn").forEach(addReviewBtn =>
    addReviewBtn.addEventListener("click", async e => {
      e.preventDefault();
      let id = e.target.dataset.id;
      console.log(id);
      let url = `/items/${id}`;
      let result = await fetch(url);
      result = await result.json();
      let reviewHtml = new String();
      let reviewsContainerHtml = reviewContainerTemplate.replace(
        "{{%TITLE%}}",
        result.title
      );
      reviewsContainerHtml = reviewsContainerHtml.replace(
        "{%ITEMID%}",
        result._id
      );
      if (result.review.length === 0)
        reviewsContainerHtml = reviewsContainerHtml.replace(
          "{%REVIEW%}",
          `<h1>No Reviews</h1>`
        );
      else
        result.review.map(review => {
          let reviewHtmlTemplate = reviewTemplate.replace(
            "{%REVIEWBODY%}",
            review.body
          );
          reviewHtmlTemplate = reviewHtmlTemplate.replace(
            "{%REVIEWID%}",
            review._id
          );
          reviewHtml += reviewHtmlTemplate;
        });
      reviewsContainerHtml = reviewsContainerHtml.replace(
        "{%REVIEW%}",
        reviewHtml
      );
      document.querySelector(
        ".reviews-container"
      ).innerHTML = reviewsContainerHtml;
      document.querySelector(".reviews-container").style.display = "flex";
      document.querySelectorAll(".add-review").forEach(addReviewBtn =>
        addReviewBtn.addEventListener("click", e => {
          e.preventDefault();
          let id = e.target.dataset.id;
          let reviewInput = document.querySelector(".review-input").value;
          let url = `/items/${id}`;
          let result = fetch(url, {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({ body: reviewInput })
          });
          document.querySelector(".review-input").value = "";
          location.reload();
        })
      );
    })
  );

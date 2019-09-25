document.querySelector(".search-btn").addEventListener("click", e => {
  e.preventDefault();
  let searchInput = document.querySelector(".search-input").value;
  fetch(`/scrape?searchInput=${searchInput}`);
});

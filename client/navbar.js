document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("nav a");

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      links.forEach(function (otherLink) {
        otherLink.classList.remove("active");
      });

      link.classList.add("active");

      localStorage.setItem("selectedLink", link.getAttribute("href"));
    });
  });

  highlightCurrentPage();
});

function highlightCurrentPage() {
  let path = window.location.pathname;

  path = path.replace(/^\/|\/$/g, "");

  const links = document.querySelectorAll("nav a");

  const selectedLink = localStorage.getItem("selectedLink");

  links.forEach(function (link) {
    let linkPath = link.getAttribute("href").replace(/^\/|\/$/g, "");
    // console.log(linkPath);
    // console.log(link);

    if (linkPath === path || linkPath === selectedLink) {
      link.classList.add("active");
    }
  });
}

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  // console.log(link.href);
  // console.log(window.location.href);
  if (link.href === window.location.href) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Select all <a> elements that are direct children of .menu-list li
  const menuLinks = document.querySelectorAll(".menu-list li > a");

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      let isActive = event.target.className == "is-active";
      // Remove 'is-active' class from all li elements and their children <a> elements
      document
        .querySelectorAll(".menu-list li.is-active")
        .forEach(function (li) {
          li.classList.remove("is-active");
          li.querySelectorAll("a.is-active").forEach(function (activeLink) {
            activeLink.classList.remove("is-active");
          });
        });
      if (isActive) {
        history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
        event.preventDefault();
        return;
      }
      // Add 'is-active' class to the parent li element of the clicked <a>
      this.parentElement.classList.add("is-active");
      // Optionally add 'is-active' to the clicked <a> element as well
      this.classList.add("is-active");
    });
  });

  // Check the initial URL fragment and activate the respective link
  if (window.location.hash) {
    const activeLink = document.querySelector(
      `.menu-list li > a[href="${window.location.hash}"]`,
    );
    if (activeLink) {
      activeLink.parentElement.classList.add("is-active");
      activeLink.classList.add("is-active");
    }
  }
});

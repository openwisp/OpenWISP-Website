document.addEventListener("DOMContentLoaded", function () {
  // Select all <a> elements that are direct children of .menu-list li
  const menuLinks = document.querySelectorAll(".menu-list li > a");

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      let isActive = event.target.className == "is-active";
      // Remove 'is-active' class from all li elements and their children <a> elements
      document.querySelectorAll(".menu-list li.is-active").forEach(function (li) {
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

  const openFragment = (fragment) => {
    if (fragment === "") {
      let activeLink = document.querySelector(".menu-list li > a.is-active");
      if (activeLink) {
        activeLink.parentElement.classList.remove("is-active");
        activeLink.classList.remove("is-active");
      }
      return;
    }
    const link = document.querySelector(
      `.menu-list li > a[href="${fragment}"]:not(.is-active)`,
    );
    if (link) {
      link.scrollIntoView({ behavior: "smooth", block: "start" });
      link.click();
    }
  };

  // Check the initial URL fragment and activate the respective link
  openFragment(window.location.hash);

  window.addEventListener("popstate", function (event) {
    openFragment(event.target.location.hash);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Bind click event to all elements with class 'open-modal'
  const openModalLinks = document.querySelectorAll("a.open-modal");
  const modalContainer = document.getElementById("modal-container");
  const getActiveModal = () => modalContainer.querySelector(".modal.is-active");

  const hideScrollbar = () => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const showScrollbar = () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };

  // Bind click event on open-modal links
  // Clone modal content to bottom of the page
  // Fade in with CSS transition
  openModalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const cell = link.closest(".cell");
      if (cell) {
        const modal = cell.querySelector(".modal");
        if (modal) {
          const clonedModal = modal.cloneNode(true);
          clonedModal.classList.add("is-active", "fade-in");
          modalContainer.appendChild(clonedModal);
          setTimeout(() => {
            getActiveModal().classList.add("visible");
            hideScrollbar();
          }, 10);
          bindClose();
        }
      }
    });
  });

  // Bind close button
  const bindClose = () => {
    getActiveModal()
      .querySelectorAll(".close")
      .forEach((close) => {
        close.addEventListener("click", (e) => {
          e.preventDefault();
          const modal = getActiveModal();
          modal.classList.remove("visible");
          setTimeout(() => {
            modal.remove();
            showScrollbar();
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search,
            );
          }, 500);
        });
      });
  };

  // Handle ESC key press to close the modal
  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      const activeModal = getActiveModal();
      if (activeModal) {
        const closeBtn = activeModal.querySelector(".close");
        if (closeBtn) {
          closeBtn.click();
        }
      }
    }
  });

  // Open modal if related fragment is open
  if (window.location.hash) {
    const activeModal = document.querySelector(
      `a.open-modal[href="${window.location.hash}"]`,
    );
    if (activeModal) {
      activeModal.click();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  if (typeof _paq === "undefined") {
    return;
  }
  var pageName = window.location.pathname.split("/").filter(Boolean).pop() || "modal";
  document.querySelectorAll("a.open-modal").forEach(function (link) {
    link.addEventListener("click", function () {
      var linkText = link.textContent.trim();
      _paq.push(["trackEvent", pageName, "open-modal", linkText]);
    });
  });
});

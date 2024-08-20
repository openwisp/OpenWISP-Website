document.addEventListener("DOMContentLoaded", () => {
  // Bind click event to all elements with class 'open-modal'
  const openModalLinks = document.querySelectorAll("a.open-modal");
  const modalContainer = document.getElementById("modal-container");
  const getActiveModal = () => {
    return modalContainer.querySelector(".modal.is-active");
  };

  // bind click event on open-modal links
  // clones modal content to bottom of the page
  // fades in with CSS transition
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
          }, 10);
          bindClose();
        }
      }
    });
  });

  // binds close button
  const bindClose = () => {
    getActiveModal()
      .querySelectorAll(".close")
      .forEach((close) => {
        close.addEventListener("click", (e) => {
          e.preventDefault();
          let modal = getActiveModal();
          modal.classList.remove("visible");
          setTimeout(() => {
            modal.remove();
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search,
            );
          }, 500);
        });
      });
  };

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

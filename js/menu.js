document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  const dropdown = document.querySelector(".dropdown");
  const hasSubmenus = document.querySelectorAll(".has-submenu");

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.toggle("active");
    burger.textContent = nav.classList.contains("active") ? "✕" : "☰";

    if (!nav.classList.contains("active")) {
      dropdown?.classList.remove("active");
      hasSubmenus.forEach((item) => item.classList.remove("active"));
    }
  });

  if (window.innerWidth <= 968) {
    const catalogLink = document.querySelector(".dropdown > a");
    if (catalogLink) {
      catalogLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle("active");

        if (!dropdown.classList.contains("active")) {
          hasSubmenus.forEach((item) => item.classList.remove("active"));
        }
      });
    }

    hasSubmenus.forEach((item) => {
      const link = item.querySelector("a");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        hasSubmenus.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
          }
        });

        item.classList.toggle("active");
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove("active");
      burger.textContent = "☰";
      dropdown?.classList.remove("active");
      hasSubmenus.forEach((item) => item.classList.remove("active"));
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 968) {
      nav.classList.remove("active");
      burger.textContent = "☰";
      dropdown?.classList.remove("active");
      hasSubmenus.forEach((item) => item.classList.remove("active"));
    } else {
      const catalogLink = document.querySelector(".dropdown > a");
      if (catalogLink) {
        catalogLink.removeEventListener("click", () => {});
        catalogLink.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropdown.classList.toggle("active");
          if (!dropdown.classList.contains("active")) {
            hasSubmenus.forEach((item) => item.classList.remove("active"));
          }
        });
      }
    }
  });

  nav.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

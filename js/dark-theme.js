// Apply theme based on stored preference or system setting
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  document.documentElement.setAttribute("data-theme", storedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark");
  document.documentElement.setAttribute("data-theme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
}

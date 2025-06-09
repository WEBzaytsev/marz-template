//
// Theme handling
//

const COLOR_SCHEME = "(prefers-color-scheme: dark)";

// Defines the default website theme used when the user hasn't
// selected a different one.
const DEFAULT_THEME = "system";
// Colors for light and dark themes in the theme-color value,
// used to change browser interface colors, like the top bar in Safari.
const META_THEME_COLORS = { light: "#fff", dark: "#151515" };

function getUserTheme() {
  return localStorage.getItem("theme") || DEFAULT_THEME;
}

function setTheme(theme) {
  if (theme === "system") {
    theme = window.matchMedia(COLOR_SCHEME).matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-bs-theme", theme);
  document
    .querySelector(`[name='theme-color']`)
    .setAttribute("content", META_THEME_COLORS[theme]);
}

function showActiveDropdownItem(btn, newItem, prevItem) {
  if (prevItem) {
    bootstrap.Button.getOrCreateInstance(prevItem).toggle();
    bootstrap.Button.getOrCreateInstance(newItem).toggle();
  }

  const btnIcon = btn.querySelector(".my-nav-link-icon use");
  const newItemIcon = newItem.querySelector(".my-dropdown-item-icon use");
  if (btnIcon && newItemIcon) {
    btnIcon.setAttribute("href", newItemIcon.getAttribute("href"));
  }

  const btnText = btn.querySelector(".my-nav-link-text");
  const newItemText = newItem.querySelector("span");
  if (btnText && newItemText) {
    btnText.innerHTML = newItemText.outerHTML;
  }
}

function initTheme() {
  setTheme(getUserTheme());
  window.matchMedia(COLOR_SCHEME).addEventListener("change", () => {
    if (getUserTheme() === "system") setTheme("system");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const btnTheme = document.getElementById("btn-theme");
    document.querySelectorAll(".my-dropdown-item-theme").forEach((item) => {
      item.addEventListener("click", () => {
        localStorage.setItem("theme", item.dataset.themeVal);
        setTheme(item.dataset.themeVal);
        showActiveDropdownItem(
          btnTheme,
          item,
          document.querySelector(".my-dropdown-item-theme.active")
        );
      });
    });

    showActiveDropdownItem(
      btnTheme,
      document.querySelector(`[data-theme-val="${getUserTheme()}"]`),
      document.querySelector(".my-dropdown-item-theme.active")
    );
  });
} 
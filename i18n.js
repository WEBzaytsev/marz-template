//
// i18n
//

// Default locale used to display content if
// the user's locale is not specified.
const DEFAULT_LOCALE = "en";

function updateDirectionAndStyles(language) {
  const html = document.documentElement;
  if (["ar", "he", "fa"].includes(language)) {
    html.setAttribute("dir", "rtl");
    switchStylesheet(
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css"
    );
  } else {
    html.setAttribute("dir", "ltr");
    switchStylesheet(
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
  }
}

function switchStylesheet(newStylesheetHref) {
  const existingLink = document.getElementById("dynamic-stylesheet");
  if (existingLink) {
    existingLink.href = newStylesheetHref;
  } else {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.id = "dynamic-stylesheet";
    link.href = newStylesheetHref;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

function getUserLocale() {
  const userLocale =
    localStorage.getItem("locale") ||
    (navigator.language || navigator.userLanguage).split("-")[0];
  return userLocale in MESSAGES ? userLocale : DEFAULT_LOCALE;
}

function initI18n() {
  document.addEventListener("alpine-i18n:ready", () => {
    window.AlpineI18n.fallbackLocale = "en";
    window.AlpineI18n.create(getUserLocale(), MESSAGES);
    document.documentElement.setAttribute("lang", getUserLocale());
    updateDirectionAndStyles(getUserLocale());

    const btnLang = document.getElementById("btn-lang");
    document.querySelectorAll(".my-dropdown-item-lang").forEach((item) => {
      item.addEventListener("click", () => {
        localStorage.setItem("locale", item.dataset.locale);
        AlpineI18n.locale = item.dataset.locale;
        updateDirectionAndStyles(item.dataset.locale);
        document.documentElement.setAttribute("lang", item.dataset.locale);
        showActiveDropdownItem(
          btnLang,
          item,
          document.querySelector(".my-dropdown-item-lang.active")
        );
      });
    });

    showActiveDropdownItem(
      btnLang,
      document.querySelector(`[data-locale="${getUserLocale()}"]`),
      document.querySelector(".my-dropdown-item-lang.active")
    );
  });
} 
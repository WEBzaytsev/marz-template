//
// Main app logic
//

// URL schemes for quick subscription import.
let SUB_URL_SCHEMES;

// Extract server name from the link
function getServerName(link) {
  try {
    if (!link) return null;

    // Try to decode URL first
    const decodedLink = decodeURIComponent(link);

    // Extract from fragment identifier (#Name)
    const fragmentMatch = decodedLink.match(/#(.+)$/);
    if (fragmentMatch) return fragmentMatch[1];

    // For vmess links
    if (decodedLink.startsWith("vmess://")) {
      try {
        const base64Data = decodedLink.replace("vmess://", "");
        const jsonData = atob(base64Data);
        const config = JSON.parse(jsonData);
        if (config.ps) return config.ps;
      } catch (e) {
        console.error("Failed to parse vmess link:", e);
      }
    }

    // For other protocols, at least show the protocol
    const protocolMatch = decodedLink.match(/^([a-z]+):\/\//);
    if (protocolMatch) return protocolMatch[1].toUpperCase() + " сервер";

    return "Сервер";
  } catch (e) {
    console.error("Error extracting server name:", e);
    return "Сервер";
  }
}

// Replace links with server names
function replaceLinksWithNames() {
  console.log("Replacing links with names...");

  // Найдем все поля ввода внутри блока "Список доступных серверов"
  try {
    // Сначала пытаемся найти все поля ввода, которые содержат протокольные ссылки
    const inputs = document.querySelectorAll(
      'input[value^="ss://"], input[value^="vless://"], input[value^="vmess://"], input[value^="trojan://"], input[value^="ssr://"]'
    );

    console.log("Found", inputs.length, "inputs with protocol links");

    if (inputs.length === 0) {
      // Если не нашли, попробуем просто найти все поля с классом my-link-separate
      const myLinkInputs = document.querySelectorAll(".my-link-separate");
      console.log(
        "Found",
        myLinkInputs.length,
        "my-link-separate inputs"
      );

      if (myLinkInputs.length === 0) {
        // Если и это не помогло, попробуем найти все поля ввода в блоках input-group
        const groupInputs = document.querySelectorAll(".input-group input");
        console.log(
          "Found",
          groupInputs.length,
          "inputs in input-groups"
        );

        processInputs(groupInputs);
      } else {
        processInputs(myLinkInputs);
      }
    } else {
      processInputs(inputs);
    }
  } catch (e) {
    console.error("Error while replacing links:", e);
  }
}

// Функция обработки найденных полей ввода
function processInputs(inputs) {
  inputs.forEach(function (input) {
    try {
      const link = input.value;
      // Проверяем, похоже ли значение на ссылку протокола
      if (
        link &&
        (link.startsWith("ss://") ||
          link.startsWith("vless://") ||
          link.startsWith("vmess://") ||
          link.startsWith("trojan://") ||
          link.startsWith("ssr://") ||
          link.startsWith("http://") ||
          link.startsWith("https://"))
      ) {
        // Сохраняем оригинальную ссылку ПЕРЕД изменением значения
        input.setAttribute("data-original-link", link);

        const name = getServerName(link);
        if (name) {
          console.log(
            "Replacing",
            link.substring(0, 20) + "...",
            "with",
            name
          );
          // input.setAttribute('data-original-link', link); // Перенесено выше
          input.value = name; // Теперь меняем значение на имя

          // Найдем соответствующую кнопку копирования и обновим её связь с оригинальной ссылкой
          const parent = input.closest(".input-group");
          if (parent) {
            const copyButton = parent.querySelector(".btn-copy-server");
            if (copyButton) {
              copyButton.setAttribute("data-link", link);
            }

            // Найдем кнопку QR-кода и обновим её связь с оригинальной ссылкой
            const qrButton = parent.querySelector(
              '[data-bs-target="#qr-code-modal"]'
            );
            if (qrButton) {
              qrButton.setAttribute("data-qr-link", link);
            }
          }

          const span = parent.querySelector(".my-link-visible");
          if (span) span.textContent = name;
        }
      }
    } catch (e) {
      console.error("Error processing input:", e);
    }
  });
}

function getTabIdByDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) {
    return "#tab-android";
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return "#tab-ios";
  } else {
    return "#tab-pc";
  }
}

function initApp() {
  SUB_URL_SCHEMES = {
    pc: `hiddify://import/${SUB_URL}`,
    android: `hiddify://import/${SUB_URL}`,
    ios: `hiddify://import/${SUB_URL}`,
    happ: `happ://add/${SUB_URL}`,
  };

  // --- Declare instances in a higher scope ---
  let toastInstance = null;
  let serverQrCodeInstance = null;
  let mainQrCodeInstance = null;
  // --- End Declare instances ---

  // Попробуем выполнить замену несколько раз
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize Toast Instance
    const toastCopyLinkElement = document.getElementById("toast-copy-link");
    if (toastCopyLinkElement) {
      toastInstance =
        bootstrap.Toast.getOrCreateInstance(toastCopyLinkElement);
    } else {
      console.error(
        "Toast element #toast-copy-link not found during initialization."
      );
    }

    // Initialize Server QR Code Instance
    const serverQrContainer = document.getElementById("server-qr-code");
    if (serverQrContainer) {
      try {
        serverQrCodeInstance = new QRCode(serverQrContainer, {
          width: 256,
          height: 256,
          colorDark: "#000",
          colorLight: "#fff",
          correctLevel: QRCode.CorrectLevel.L,
        });
        console.log("serverQrCodeInstance initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize serverQrCodeInstance:", e);
      }
    } else {
      console.error(
        "server-qr-code container not found during initialization."
      );
    }

    // Initialize Main QR Code Instance
    const qrContainerMain = document.getElementById("qr-code");
    if (qrContainerMain) {
      try {
        // Check if SUB_URL was rendered correctly
        if (SUB_URL && !SUB_URL.startsWith("{")) {
          mainQrCodeInstance = new QRCode(qrContainerMain, {
            text: SUB_URL,
            width: 256,
            height: 256,
            colorDark: "#000",
            colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.L,
          });
          console.log("Main QR code initialized successfully.");
        } else {
          console.warn(
            "Main QR code NOT initialized because SUB_URL is invalid:",
            SUB_URL
          );
          // Optionally display a placeholder or error message in qrContainerMain
          qrContainerMain.textContent = "Ошибка: URL подписки не определен.";
        }
      } catch (e) {
        console.error("Failed to initialize mainQrCodeInstance:", e);
      }
    } else {
      console.error("qr-code container not found during initialization.");
    }

    // Выполняем замену имен серверов несколько раз для надежности
    replaceLinksWithNames();
    setTimeout(replaceLinksWithNames, 500);
    setTimeout(replaceLinksWithNames, 1000);
    setTimeout(replaceLinksWithNames, 2000);

    // Инициализация кнопки выбора платформы с правильной иконкой и текстом
    const btnGuide = document.getElementById("btn-guide");
    if (btnGuide) {
      const initialTabId = getTabIdByDevice(); // Получаем ID таба в зависимости от устройства
      const initialTab = document.querySelector(
        `.my-dropdown-item-guide[data-bs-target="${initialTabId}"]`
      );

      if (initialTab) {
        // Активируем нужный таб по умолчанию
        bootstrap.Tab.getOrCreateInstance(initialTab).show();

        // Обновляем иконку и текст в кнопке меню
        showActiveDropdownItem(btnGuide, initialTab);

        // Добавляем обработчики для переключения платформы при клике
        document
          .querySelectorAll(".my-dropdown-item-guide")
          .forEach((item) => {
            item.addEventListener("click", () => {
              showActiveDropdownItem(btnGuide, item);
            });
          });
      }
    }

    // Инициализация URI-схем для быстрого импорта подписок
    for (const [os, url] of Object.entries(SUB_URL_SCHEMES)) {
      const element = document.getElementById(`sub-url-${os}`);
      if (element) {
        element.href = url;
      }
    }

    // Дополнительная поддержка для специфичных кнопок приложений
    const androidHappBtn = document.getElementById("sub-url-android-happ");
    if (androidHappBtn) {
      androidHappBtn.href = SUB_URL_SCHEMES.happ;
    }

    const iosHappBtn = document.getElementById("sub-url-ios-happ");
    if (iosHappBtn) {
      iosHappBtn.href = SUB_URL_SCHEMES.happ;
    }

    const pcHappBtn = document.getElementById("sub-url-pc-happ");
    if (pcHappBtn) {
      pcHappBtn.href = SUB_URL_SCHEMES.happ;
    }

    // QR code for main subscription
    const qrContainer = document.getElementById("qr-code");
    qrContainer.innerHTML = ""; // Очищаем контейнер на всякий случай
    new QRCode(qrContainer, {
      text: SUB_URL,
      width: 256,
      height: 256,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.L,
    });

    // QR Modal setup
    const qrModal = document.getElementById("qr-code-modal");
    if (qrModal) {
      qrModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        const serverLink = button.getAttribute("data-qr-link"); // Get link directly from the button
        const modalTitleElement = document.getElementById("qr-modal-title");
        console.log(
          "QR modal show event. Button:",
          button,
          "Link from data-qr-link:",
          serverLink
        );

        if (!serverLink) {
          console.error("QR button is missing data-qr-link attribute!");
          alert("Не удалось получить ссылку для QR-кода.");
          return;
        }

        if (!serverQrCodeInstance) {
          console.error("serverQrCodeInstance is not initialized!");
          alert("Ошибка инициализации QR-генератора.");
          return;
        }

        if (!modalTitleElement) {
          console.error("modalTitleElement #qr-modal-title not found!");
          // Continue without title if necessary
        }

        // Update modal title
        const name = getServerName(serverLink);
        if (modalTitleElement) {
          modalTitleElement.textContent = name || "QR Code";
        }

        // Generate QR code
        try {
          serverQrCodeInstance.clear();
          serverQrCodeInstance.makeCode(serverLink);
          console.log("QR code generated for:", serverLink);
        } catch (e) {
          console.error("Error generating QR code:", e);
          alert("Не удалось сгенерировать QR-код: " + e.message);
        }
      });
    }

    // Copy server link buttons
    document.querySelectorAll(".btn-copy-server").forEach((button) => {
      button.addEventListener("click", () => {
        let link = null;
        // --- Retrieve link from related input's data-original-link ---
        const parentGroup = button.closest(".input-group");
        if (parentGroup) {
          const relatedInput =
            parentGroup.querySelector("[data-original-link]");
          if (relatedInput) {
            link = relatedInput.getAttribute("data-original-link");
            console.log(
              "Copy button: Link retrieved from input data-original-link:",
              link
            );
          } else {
            console.error(
              "Copy button: Could not find related input with data-original-link."
            );
          }
        } else {
          console.error(
            "Copy button: Could not find parent .input-group for button."
          );
        }
        // --- End Retrieve link ---

        // console.log('Copy button clicked. Link retrieved:', link);

        if (!link) {
          console.error("Copy button is missing data-link attribute!", button);
          alert("Не удалось найти ссылку для копирования.");
          return;
        }

        navigator.clipboard
          .writeText(link)
          .then(() => {
            console.log("Server link copied successfully!");
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check-lg"></i>';
            button.disabled = true;

            // Show toast notification
            const toastText = document.getElementById("toast-copy-text");
            let copiedText = "Скопировано";
            if (typeof AlpineI18n !== "undefined" && AlpineI18n.t) {
              try {
                copiedText = AlpineI18n.t("copiedToClipboard") || copiedText;
              } catch (e) {
                console.warn("AlpineI18n.t('copiedToClipboard') failed:", e);
              }
            }
            if (toastText) toastText.textContent = copiedText;

            if (toastInstance) {
              toastInstance.show();
            } else {
              console.error("Toast instance is not available.");
              // Fallback notification if toast fails
              // alert(copiedText);
            }

            setTimeout(() => {
              button.innerHTML = originalHTML;
              button.disabled = false;
            }, 1500);
          })
          .catch((err) => {
            console.error("Failed to copy server link: ", err);
            alert("Не удалось скопировать ссылку: " + err);
          });
      });
    });
  });
} 
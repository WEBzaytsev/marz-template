function initAlpine() {
  document.addEventListener("alpine:init", () => {
    Alpine.data("copyLink", () => ({
      isDisabled: false,
      copyToClipboard() {
        navigator.clipboard.writeText(SUB_URL);
        this.isDisabled = true;
        setTimeout(() => {
          this.isDisabled = false;
        }, 3000);
      },
    }));

    Alpine.data("blockName", () => ({
      username: USER_DATA.username,
      getText() {
        if (!this.username.startsWith("{")) {
          return this.username;
        } else {
          return "Unknown";
        }
      },
    }));

    Alpine.data("blockStatus", () => ({
      statusValue: USER_DATA.status,
      getIcon() {
        if (this.statusValue == "active" || this.statusValue.startsWith("{")) {
          return "#emoji-smile-fill";
        } else {
          return "#emoji-frown-fill";
        }
      },
      getText() {
        if (this.statusValue == "active") {
          return AlpineI18n.t("active");
        } else if (this.statusValue == "limited") {
          return AlpineI18n.t("limited");
        } else if (this.statusValue == "expired") {
          return AlpineI18n.t("expired");
        } else if (this.statusValue == "disabled") {
          return AlpineI18n.t("disabled");
        } else if (this.statusValue.startsWith("{")) {
          return "Unknown";
        }
      },
    }));

    Alpine.data("blockDuration", () => ({
      expire: USER_DATA.expire,
      getText() {
        if (!this.expire) {
          return AlpineI18n.t("forever");
        } else if (!this.expire.startsWith("{")) {
          const date = new Date(this.expire).toLocaleDateString();
          return `${AlpineI18n.t("until")} ${date}`;
        } else {
          return "Unknown";
        }
      },
    }));

    Alpine.data("blockTraffic", () => ({
      usedTraffic: USER_DATA.used_traffic,
      dataLimit: USER_DATA.data_limit,
      getText() {
        if (!this.dataLimit) {
          return `${this.usedTraffic} / ∞`;
        } else if (!this.dataLimit.startsWith("{")) {
          return `${this.usedTraffic} / ${this.dataLimit}`;
        } else {
          return "Unknown";
        }
      },
    }));
  });
} 
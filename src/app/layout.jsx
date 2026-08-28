import React from "react";
import Providers from "./providers";

import "@/index.css";
import "@/assets/styles/global.css";
import "@/assets/styles/typography.css";
import "@/assets/styles/layout.css";

export const metadata = {
  title: "SquadCart Console",
  description: "Manage your SquadCart store, inventory, orders, invoices, and analytics.",
};

export default function RootLayout({ children }) {
  const themeInitScript = `
    (function () {
      const theme = localStorage.getItem("theme") || (localStorage.getItem("darkMode") === "true" ? "dark" : "light");
      const customColor = localStorage.getItem("customColor");
      var isDark = theme === "dark" || (theme === "custom" && localStorage.getItem("darkMode") === "true");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      if (theme === "custom" && customColor) {
        document.documentElement.setAttribute("data-theme", "custom");
        document.documentElement.style.setProperty("--nexus-primary", customColor);
        document.documentElement.style.setProperty("--nexus-secondary", customColor);
        (function (hex) {
          var n = hex.replace(/^#/, "");
          var r = parseInt(n.slice(0, 2), 16) / 255, g = parseInt(n.slice(2, 4), 16) / 255, b = parseInt(n.slice(4, 6), 16) / 255;
          var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
          if (max !== min) {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
          }
          var H = Math.round(h * 360), S = Math.round(s * 100), L = Math.round(l * 100);
          document.documentElement.style.setProperty("--primary", H + " " + S + "% " + L + "%");
          document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%");
        })(customColor);
      }
    })();
  `;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

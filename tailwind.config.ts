import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#ede8e3",
        surface: "#ffffff",
        soft: "#f2f4f6",
        primary: "#ee5d2e",
        "primary-hover": "#c6421a",
        "primary-soft": "#fceadf",
        text: "#201a16",
        "text-strong": "#26201c",
        "text-soft": "#4a423c",
        muted: "#8b817a",
        "muted-soft": "#a79e97",
        border: "#eef0f2",
        "border-warm": "#eee7e0",
        danger: "#d0442a",
        success: "#6fa35f",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        shell: "0 6px 28px rgba(30, 20, 15, 0.06)",
        menu: "0 12px 30px rgba(60, 40, 30, 0.16)",
      },
    },
  },
  plugins: [],
} satisfies Config;

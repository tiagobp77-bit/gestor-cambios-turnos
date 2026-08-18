module.exports = {
  content: ["./index.html", "./src/app.jsx"],
  theme: {
    extend: {
      colors: {
        keralty: { blue: "#002855", green: "#8CC63F" }
      },
      animation: {
        "bounce-short": "bounce 1s ease-in-out 3",
        "fade-in": "fadeIn 0.5s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

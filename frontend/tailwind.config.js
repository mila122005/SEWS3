/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:      "#0d6e5a",
          hover:        "#0a5544",
          accent:       "#4dd9c0",
          panel:        "#0d1b2e",
          "panel-card": "#1d3a52",    
          "panel-border": "#2a4a63", 
        },
        neutral: {
          bg:     "#ffffff",
          border: "#e2e8f0",
          muted:  "#94a3b8",
          text:   "#1e293b",
          subtle: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        input: "0.5rem",
        card:  "0.75rem",
        btn:   "0.5rem",
      },
      boxShadow: {
        input: "0 0 0 3px rgba(13,110,90,0.18)",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
};
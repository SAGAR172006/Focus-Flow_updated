import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.jsx"; // Changed from .tsx
import "./index.css";

// Removed the "!" after getElementById("root")
createRoot(document.getElementById("root")).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <App />
  </ThemeProvider>
);
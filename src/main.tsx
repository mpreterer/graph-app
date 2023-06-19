import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./App.css";
import { worker } from "./mocks/browser.js";

if (process.env.NODE_ENV === "development") {
  worker.start();
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

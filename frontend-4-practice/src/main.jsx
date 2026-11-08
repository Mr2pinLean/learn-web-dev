import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles.css";

// StrictMode здесь не включаем: в учебном задании важно видеть один
// запрос при монтировании компонента, а не повторный dev-запрос StrictMode.
createRoot(document.getElementById("root")).render(<App />);

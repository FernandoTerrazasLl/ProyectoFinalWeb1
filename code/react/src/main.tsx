import { createRoot } from "react-dom/client";
import { App } from "@app/App";

const root = document.querySelector("#app");

if (!root)
  throw new Error("No se encontro el contenedor principal de CuraMente.");

createRoot(root).render(<App />);

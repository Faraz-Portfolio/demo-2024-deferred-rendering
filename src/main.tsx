import { Leva } from "leva";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <>
    <Leva hidden />
    <App />
  </>
);

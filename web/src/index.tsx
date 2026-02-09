import { createRoot } from "react-dom/client";
import MaintenanceView from "./views/MaintenanceView";
import App from "./App";
import CONFIG from "./config";
import "./index.css";

const appRoot = document.getElementById("root") as HTMLElement;
const root = createRoot(appRoot);
if (CONFIG.maintenanceMode) root.render(<MaintenanceView />);
else root.render(<App />);

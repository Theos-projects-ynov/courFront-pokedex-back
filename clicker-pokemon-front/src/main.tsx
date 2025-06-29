import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./router/router";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (
      confirm("Une nouvelle version est disponible. Voulez-vous mettre à jour?")
    ) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("L'application est prête à être utilisée hors ligne");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </StrictMode>
);

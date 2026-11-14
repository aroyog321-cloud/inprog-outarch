import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@xterm/xterm/css/xterm.css";
import App from "./App.jsx";
import DetachedTerminalWindow, { readPopoutRoute } from "./DetachedTerminalWindow.jsx";
import "./tokens.css";
import "./styles.css";
import "./uiFoundation.css";
import "./groundstation21.css";
import "./missionGraph.css";
import "./projectMemory.css";
import "./vscodeBridge.css";
import "./mcpGateway.css";
import "./agentSupervision.css";
import "./automationWorkflows.css";
import "./mobileCompanion.css";
import "./missionAi.css";
import "./workspaceRecipes2.css";
import "./premiumDesign.css";
// Feature-complete route styling retained below the authoritative shell layer.
// The redesign files that follow own navigation, responsive geometry and tokens.
import "./premiumV3.css";
// Authoritative redesign layer — loaded last, token-driven, no override war.
// See src/groundstation/renderer/redesign/README.md.
import "./redesign/tokens-bridge.css";
import "./redesign/base.css";
import "./redesign/workspace.css";
import "./redesign/screens.css";
// Density pass: page headers, meter strips, accent discipline, deck + pane
// header overflow, empty states. See redesign/README.md.
import "./redesign/cockpit.css";
// Account, plan and update surfaces: the sign-in screen, the crown, the upgrade
// dialog, Settings > Account and plan.
import "./redesign/account.css";
// Shared primitives resolve last: trust, decisions, skeletons, live telemetry,
// status chips and desktop feedback all have one renderer-owned grammar.
import "./redesign/surfaces.css";

document.documentElement.lang = navigator.language || "en";

// §3.6 drawing engine — Excalidraw loads its scene fonts at runtime by fetching
// "fonts/<Family>/<file>.woff2" against this base (see ExcalidrawFontFace
// createUrls). The fonts are self-hosted from renderer/public/excalidraw-assets
// (all families except the 12MB CJK Xiaolai, whose glyphs degrade to system
// metrics when a CJK font family is requested — a documented degradation, not
// an error). Must be set before the lazily-loaded drawing chunk runs.
window.EXCALIDRAW_ASSET_PATH = new URL("excalidraw-assets/", document.baseURI).href;

// A detached terminal window loads this same bundle. The query says which view
// to mount; the main process already decided which worker the window is for and
// scopes its protocol connection accordingly, so this is routing, not authority.
const popoutRoute = readPopoutRoute();

createRoot(document.getElementById("root")).render(
  // Groundstation effects own explicit IPC terminal subscriptions. React's
  // development-only StrictMode remount would open a second stream before the
  // asynchronous close request from the first mount reaches the main process.
  popoutRoute ? <DetachedTerminalWindow route={popoutRoute} /> : <App />
);

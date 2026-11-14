(async function () {
  const report = { fetchFont: null, workerModule: null, fontFace: null, canvasFont: null };
  // 1 — fetch() a sibling woff2, exactly the shape Excalidraw uses.
  try {
    const response = await fetch("./Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2", { cache: "force-cache" });
    report.fetchFont = response.ok ? "ok " + (await response.arrayBuffer()).byteLength + "B" : "http " + response.status;
  } catch (error) { report.fetchFont = "threw: " + error; }
  // 2 — module worker from a sibling file.
  report.workerModule = await new Promise(resolve => {
    try {
      const worker = new Worker("./worker.mjs", { type: "module" });
      worker.onmessage = event => { resolve("ok: " + event.data); worker.terminate(); };
      worker.onerror = event => { resolve("error: " + (event.message || "unknown")); worker.terminate(); };
      setTimeout(() => resolve("timeout"), 5000);
    } catch (error) { resolve("threw: " + error); }
  });
  // 3 — register the fetched font and check the family becomes available.
  try {
    const response = await fetch("./Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2");
    const face = new FontFace("ProbeExcalifont", await response.arrayBuffer());
    await face.load();
    document.fonts.add(face);
    report.fontFace = document.fonts.check("16px ProbeExcalifont") ? "registered" : "registered-but-not-resolvable";
  } catch (error) { report.fontFace = "threw: " + error; }
  // 4 — does a canvas pick the registered family up.
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px ProbeExcalifont";
    report.canvasFont = context.font.includes("ProbeExcalifont") ? "usable" : "fallback: " + context.font;
  } catch (error) { report.canvasFont = "threw: " + error; }
  document.title = "REPORT:" + JSON.stringify(report);
})();
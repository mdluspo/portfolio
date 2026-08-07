const hasWebAssembly = () => {
  try {
    if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
      );
      return module instanceof WebAssembly.Module && new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
    }
  } catch {
    return false;
  }

  return false;
};

const statusEl = document.getElementById("status");
const canvas = document.getElementById("canvas");
const doomKeyMap = {
  w: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  a: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  s: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  d: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  e: { key: " ", code: "Space", keyCode: 32 },
};
const doomTouchKeyMap = {
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  Control: { key: "Control", code: "ControlLeft", keyCode: 17 },
  Space: { key: " ", code: "Space", keyCode: 32 },
  Shift: { key: "Shift", code: "ShiftLeft", keyCode: 16 },
  Escape: { key: "Escape", code: "Escape", keyCode: 27 },
};

function dispatchDoomKey(type, mapped) {
  canvas?.dispatchEvent(
    new KeyboardEvent(type, {
      ...mapped,
      which: mapped.keyCode,
      bubbles: true,
      cancelable: true,
    }),
  );
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function startDoom() {
  if (!hasWebAssembly()) {
    setStatus("WebAssembly is not supported in this browser.");
    return;
  }

  window.Module = {
    noInitialRun: true,
    arguments: [],
    locateFile(path) {
      return `/games/doom/${path}`;
    },
    preRun: [
      function preloadFiles() {
        window.Module.FS.createPreloadedFile("", "Doom2.wad", "/games/doom/Doom2.wad", true, true);
        window.Module.FS.createPreloadedFile("", "default.cfg", "/games/doom/default.cfg", true, true);
      },
    ],
    onRuntimeInitialized() {
      setStatus("Loaded. Click the game, then use arrows/WASD, Ctrl or Space to fire.");
      canvas?.focus();
      window.callMain([
        "-iwad",
        "Doom2.wad",
        "-window",
        "-nogui",
        "-nomusic",
        "-config",
        "default.cfg",
      ]);
    },
    canvas,
    print(text) {
      console.log(text);
    },
    printErr(text) {
      console.error(text);
      setStatus(String(text));
    },
    setStatus,
    monitorRunDependencies(left) {
      setStatus(left ? `Loading DOOM... ${left} file(s) remaining` : "Starting DOOM...");
    },
  };

  canvas?.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    setStatus("WebGL context lost. Reload the game.");
  });

  window.addEventListener(
    "keydown",
    (event) => {
      const mapped = doomKeyMap[event.key.toLowerCase()];
      if (!mapped || event.repeat) return;
      event.preventDefault();
      dispatchDoomKey("keydown", mapped);
    },
    true,
  );

  window.addEventListener(
    "keyup",
    (event) => {
      const mapped = doomKeyMap[event.key.toLowerCase()];
      if (!mapped) return;
      event.preventDefault();
      dispatchDoomKey("keyup", mapped);
    },
    true,
  );

  window.addEventListener("message", (event) => {
    if (event.data !== "resume-game") return;
    canvas?.focus();
  });

  document.querySelectorAll("[data-doom-key]").forEach((button) => {
    const mapped = doomTouchKeyMap[button.dataset.doomKey];
    if (!mapped) return;

    const press = (event) => {
      event.preventDefault();
      button.classList.add("is-pressed");
      canvas?.focus();
      dispatchDoomKey("keydown", mapped);
    };

    const release = (event) => {
      event.preventDefault();
      button.classList.remove("is-pressed");
      dispatchDoomKey("keyup", mapped);
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });

  const script = document.createElement("script");
  script.src = "/games/doom/websockets-doom.js";
  script.async = true;
  document.body.appendChild(script);
}

startDoom();

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
const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystick-knob");
const doomKeyMap = {
  w: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  a: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  s: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  d: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  e: { key: " ", code: "Space", keyCode: 32 },
};
const heldMobileKeys = new Map();

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function dispatchDoomKey(type, keyConfig) {
  canvas?.dispatchEvent(
    new KeyboardEvent(type, {
      key: keyConfig.key,
      code: keyConfig.code,
      keyCode: keyConfig.keyCode,
      which: keyConfig.keyCode,
      bubbles: true,
      cancelable: true,
    }),
  );
}

function holdDoomKey(id, keyConfig) {
  if (heldMobileKeys.has(id)) return;
  heldMobileKeys.set(id, keyConfig);
  dispatchDoomKey("keydown", keyConfig);
}

function releaseDoomKey(id) {
  const keyConfig = heldMobileKeys.get(id);
  if (!keyConfig) return;
  heldMobileKeys.delete(id);
  dispatchDoomKey("keyup", keyConfig);
}

function releaseAllMobileKeys() {
  Array.from(heldMobileKeys.keys()).forEach(releaseDoomKey);
}

function setupMobileControls() {
  const directions = {
    up: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
    down: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
    left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
    right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  };

  const applyJoystick = (clientX, clientY) => {
    if (!joystick || !joystickKnob) return;
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = clientX - centerX;
    const rawY = clientY - centerY;
    const max = rect.width * 0.32;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > max ? max / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    const threshold = rect.width * 0.16;
    const active = {
      left: rawX < -threshold,
      right: rawX > threshold,
      up: rawY < -threshold,
      down: rawY > threshold,
    };

    Object.entries(directions).forEach(([name, keyConfig]) => {
      const id = `joy-${name}`;
      if (active[name]) {
        holdDoomKey(id, keyConfig);
      } else {
        releaseDoomKey(id);
      }
    });
  };

  const resetJoystick = () => {
    joystickKnob && (joystickKnob.style.transform = "translate(-50%, -50%)");
    Object.keys(directions).forEach((name) => releaseDoomKey(`joy-${name}`));
  };

  joystick?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joystick.setPointerCapture(event.pointerId);
    canvas?.focus();
    applyJoystick(event.clientX, event.clientY);
  });

  joystick?.addEventListener("pointermove", (event) => {
    if (!joystick.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    applyJoystick(event.clientX, event.clientY);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
    joystick?.addEventListener(type, (event) => {
      if (joystick.hasPointerCapture(event.pointerId)) {
        joystick.releasePointerCapture(event.pointerId);
      }
      resetJoystick();
    });
  });

  document.querySelectorAll("[data-doom-key]").forEach((button) => {
    const keyConfig = {
      key: button.dataset.doomKey,
      code: button.dataset.doomCode,
      keyCode: Number(button.dataset.doomKeycode),
    };
    const id = `button-${keyConfig.code}`;

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-held");
      canvas?.focus();
      holdDoomKey(id, keyConfig);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      button.addEventListener(type, (event) => {
        button.releasePointerCapture?.(event.pointerId);
        button.classList.remove("is-held");
        releaseDoomKey(id);
      });
    });
  });

  window.addEventListener("blur", releaseAllMobileKeys);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) releaseAllMobileKeys();
  });
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

  const script = document.createElement("script");
  script.src = "/games/doom/websockets-doom.js";
  script.async = true;
  document.body.appendChild(script);
}

setupMobileControls();
startDoom();

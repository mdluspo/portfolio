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
const doomAssetBase = new URL(".", document.currentScript?.src ?? window.location.href);
const doomKeyMap = {
  w: { key: "w", code: "KeyW", keyCode: 87 },
  a: { key: "a", code: "KeyA", keyCode: 65 },
  s: { key: "s", code: "KeyS", keyCode: 83 },
  d: { key: "d", code: "KeyD", keyCode: 68 },
  e: { key: "e", code: "KeyE", keyCode: 69 },
};
const doomTouchKeyMap = {
  ArrowUp: { key: "w", code: "KeyW", keyCode: 87 },
  ArrowLeft: { key: "a", code: "KeyA", keyCode: 65 },
  ArrowDown: { key: "s", code: "KeyS", keyCode: 83 },
  ArrowRight: { key: "d", code: "KeyD", keyCode: 68 },
  Control: { key: "Control", code: "ControlLeft", keyCode: 17 },
  Space: { key: " ", code: "Space", keyCode: 32 },
  KeyE: { key: "e", code: "KeyE", keyCode: 69 },
  Enter: { key: "Enter", code: "Enter", keyCode: 13 },
  Shift: { key: "Shift", code: "ShiftLeft", keyCode: 16 },
  Escape: { key: "Escape", code: "Escape", keyCode: 27 },
};

function dispatchDoomKey(type, mapped) {
  const eventInit = {
      ...mapped,
      which: mapped.keyCode,
      bubbles: true,
      cancelable: true,
  };
  const targets = [canvas, document, window].filter(Boolean);

  targets.forEach((target) => {
    const event = new KeyboardEvent(type, eventInit);
    Object.defineProperties(event, {
      keyCode: { get: () => mapped.keyCode },
      which: { get: () => mapped.keyCode },
      doomSynthetic: { get: () => true },
    });
    target.dispatchEvent(event);
  });
}

function setPressedKeys(nextKeys, activeKeys) {
  activeKeys.forEach((key) => {
    if (nextKeys.has(key)) return;
    const mapped = doomTouchKeyMap[key];
    if (mapped) dispatchDoomKey("keyup", mapped);
    activeKeys.delete(key);
  });

  nextKeys.forEach((key) => {
    if (activeKeys.has(key)) return;
    const mapped = doomTouchKeyMap[key];
    if (mapped) dispatchDoomKey("keydown", mapped);
    activeKeys.add(key);
  });
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function startDoom() {
  if (!hasWebAssembly()) {
    setStatus("WebAssembly is not supported in this browser.");
    return;
  }

  if (canvas) {
    canvas.requestPointerLock = () => {};
    canvas.mozRequestPointerLock = undefined;
    canvas.webkitRequestPointerLock = undefined;
    canvas.msRequestPointerLock = undefined;
  }

  window.Module = {
    noInitialRun: true,
    arguments: [],
    elementPointerLock: false,
    lockPointer: false,
    locateFile(path) {
      return new URL(path, doomAssetBase).href;
    },
    preRun: [
      function preloadFiles() {
        window.Module.FS.createPreloadedFile("", "Doom2.wad", new URL("Doom2.wad", doomAssetBase).href, true, true);
        window.Module.FS.createPreloadedFile("", "default.cfg", new URL("default.cfg", doomAssetBase).href, true, true);
      },
    ],
    onRuntimeInitialized() {
      setStatus("Loaded. Click the game, then use WASD, Space to fire, E to use.");
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
      if (event.doomSynthetic) return;
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
      if (event.doomSynthetic) return;
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

  document.querySelectorAll("[data-doom-key], [data-doom-keys]").forEach((button) => {
    const keyNames = (button.dataset.doomKeys ?? button.dataset.doomKey ?? "").split(",").map((key) => key.trim());
    const mappedKeys = keyNames.map((key) => doomTouchKeyMap[key]).filter(Boolean);
    if (mappedKeys.length === 0) return;

    const press = (event) => {
      event.preventDefault();
      button.classList.add("is-pressed");
      canvas?.focus();
      mappedKeys.forEach((mapped) => dispatchDoomKey("keydown", mapped));
    };

    const release = (event) => {
      event.preventDefault();
      button.classList.remove("is-pressed");
      mappedKeys.forEach((mapped) => dispatchDoomKey("keyup", mapped));
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });

  const joystick = document.querySelector("[data-doom-joystick]");
  if (joystick) {
    const activeMovementKeys = new Set();
    const maxTravel = 34;
    const deadzone = 14;

    const updateJoystick = (event) => {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rawX = event.clientX - centerX;
      const rawY = event.clientY - centerY;
      const distance = Math.hypot(rawX, rawY);
      const limited = Math.min(maxTravel, distance);
      const unitX = distance > 0 ? rawX / distance : 0;
      const unitY = distance > 0 ? rawY / distance : 0;
      const stickX = unitX * limited;
      const stickY = unitY * limited;
      const nextKeys = new Set();

      joystick.style.setProperty("--stick-x", `${stickX}px`);
      joystick.style.setProperty("--stick-y", `${stickY}px`);

      if (distance > deadzone) {
        if (rawY < -deadzone) nextKeys.add("ArrowUp");
        if (rawY > deadzone) nextKeys.add("ArrowDown");
        if (rawX < -deadzone) nextKeys.add("ArrowLeft");
        if (rawX > deadzone) nextKeys.add("ArrowRight");
      }

      setPressedKeys(nextKeys, activeMovementKeys);
    };

    const releaseJoystick = (event) => {
      event?.preventDefault();
      joystick.classList.remove("is-active");
      joystick.style.setProperty("--stick-x", "0px");
      joystick.style.setProperty("--stick-y", "0px");
      setPressedKeys(new Set(), activeMovementKeys);
      if (event && joystick.hasPointerCapture(event.pointerId)) {
        joystick.releasePointerCapture(event.pointerId);
      }
    };

    joystick.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      canvas?.focus();
      joystick.setPointerCapture(event.pointerId);
      joystick.classList.add("is-active");
      updateJoystick(event);
    });

    joystick.addEventListener("pointermove", (event) => {
      if (!joystick.classList.contains("is-active")) return;
      event.preventDefault();
      updateJoystick(event);
    });

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
    joystick.addEventListener("lostpointercapture", releaseJoystick);
  }

  const script = document.createElement("script");
  script.src = new URL("websockets-doom.js", doomAssetBase).href;
  script.async = true;
  document.body.appendChild(script);
}

startDoom();

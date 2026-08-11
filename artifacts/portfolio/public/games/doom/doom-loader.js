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
const focusMenu = document.getElementById("focus-menu");
const resumeButton = document.getElementById("resume-game");
const doomKeyMap = {
  e: { key: "e", code: "KeyE", keyCode: 69 },
  " ": { key: " ", code: "Space", keyCode: 32 },
};
const heldMobileKeys = new Map();
const lastTapById = new Map();

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function dispatchDoomKey(type, keyConfig) {
  const eventInit = {
      key: keyConfig.key,
      code: keyConfig.code,
      keyCode: keyConfig.keyCode,
      which: keyConfig.keyCode,
      bubbles: true,
      cancelable: true,
  };

  window.dispatchEvent(new KeyboardEvent(type, eventInit));
  document.dispatchEvent(new KeyboardEvent(type, eventInit));
  canvas?.dispatchEvent(new KeyboardEvent(type, eventInit));
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

function tapDoomKey(id, keyConfig, cooldown = 180) {
  const now = performance.now();
  if (now - (lastTapById.get(id) ?? 0) < cooldown) return;
  lastTapById.set(id, now);
  dispatchDoomKey("keydown", keyConfig);
  window.setTimeout(() => dispatchDoomKey("keyup", keyConfig), 42);
}

function setFocusMenuVisible(isVisible) {
  focusMenu?.classList.toggle("is-visible", isVisible);
}

function resumeGame() {
  setFocusMenuVisible(false);
  canvas?.focus();
}

function setControlMode(mode) {
  document.body.classList.toggle("menu-mode", mode === "menu");
}

function isMenuMode() {
  return document.body.classList.contains("menu-mode");
}

function setupMobileControls() {
  const stickBindings = {
    move: {
      up: { key: "w", code: "KeyW", keyCode: 87 },
      down: { key: "s", code: "KeyS", keyCode: 83 },
      left: { key: "a", code: "KeyA", keyCode: 65 },
      right: { key: "d", code: "KeyD", keyCode: 68 },
    },
    aim: {
      left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
      right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
    },
  };
  const menuBindings = {
    up: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
    down: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
    left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
    right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  };

  const applyJoystick = (stick, knob, stickName, clientX, clientY) => {
    const bindings = stickBindings[stickName];
    if (!bindings) return;
    const rect = stick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = clientX - centerX;
    const rawY = clientY - centerY;
    const max = rect.width * 0.32;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > max ? max / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    const threshold = rect.width * 0.16;
    const active = {
      left: rawX < -threshold,
      right: rawX > threshold,
      up: rawY < -threshold,
      down: rawY > threshold,
    };

    if (stickName === "move" && isMenuMode()) {
      Object.keys(bindings).forEach((name) => releaseDoomKey(`${stickName}-${name}`));
      const horizontal = Math.abs(rawX);
      const vertical = Math.abs(rawY);
      const dominant =
        Math.max(horizontal, vertical) <= threshold
          ? null
          : vertical >= horizontal
            ? rawY < 0
              ? "up"
              : "down"
            : rawX < 0
              ? "left"
              : "right";

      if (dominant && menuBindings[dominant]) {
        tapDoomKey(`menu-${dominant}`, menuBindings[dominant], 260);
      }
      return;
    }

    if (stickName === "aim") {
      Object.keys(bindings).forEach((name) => releaseDoomKey(`${stickName}-${name}`));
      const aimThreshold = rect.width * 0.24;
      const dominant = Math.abs(rawX) <= aimThreshold ? null : rawX < 0 ? "left" : "right";
      if (dominant && bindings[dominant]) {
        tapDoomKey(`aim-${dominant}`, bindings[dominant], 170);
      }
      return;
    }

    Object.entries(bindings).forEach(([name, keyConfig]) => {
      const id = `${stickName}-${name}`;
      if (active[name]) {
        holdDoomKey(id, keyConfig);
      } else {
        releaseDoomKey(id);
      }
    });
  };

  const resetJoystick = (knob, stickName) => {
    knob.style.transform = "translate(-50%, -50%)";
    Object.keys(stickBindings[stickName] ?? {}).forEach((name) => releaseDoomKey(`${stickName}-${name}`));
  };

  document.querySelectorAll("[data-stick]").forEach((stick) => {
    const stickName = stick.dataset.stick;
    const knob = stick.querySelector(".joystick-knob");
    if (!stickName || !knob) return;

    stick.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      stick.setPointerCapture(event.pointerId);
      resumeGame();
      if (stickName === "aim") setControlMode("game");
      applyJoystick(stick, knob, stickName, event.clientX, event.clientY);
    });

    stick.addEventListener("pointermove", (event) => {
      if (!stick.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      applyJoystick(stick, knob, stickName, event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      stick.addEventListener(type, (event) => {
        if (stick.hasPointerCapture(event.pointerId)) {
          stick.releasePointerCapture(event.pointerId);
        }
        resetJoystick(knob, stickName);
      });
    });
  });

  document.querySelectorAll("[data-doom-key]").forEach((button) => {
    const keyConfig = {
      key: button.dataset.doomKey,
      code: button.dataset.doomCode,
      keyCode: Number(button.dataset.doomKeycode),
    };
    const id = `button-${keyConfig.code}`;
    const nextMode = button.dataset.controlMode;

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-held");
      resumeGame();
      if (nextMode === "game" || nextMode === "menu") setControlMode(nextMode);
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
  canvas?.addEventListener("blur", () => {
    releaseAllMobileKeys();
    setControlMode("menu");
    setFocusMenuVisible(true);
  });
  canvas?.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    releaseAllMobileKeys();
    setControlMode("menu");
    setFocusMenuVisible(true);
  });
  canvas?.addEventListener("pointerdown", resumeGame);
  focusMenu?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    resumeGame();
  });
  resumeButton?.addEventListener("click", resumeGame);
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
      if (!event.isTrusted) return;
      const mapped = doomKeyMap[event.key.toLowerCase()];
      if (!mapped || event.repeat || mapped.code === event.code) return;
      event.preventDefault();
      dispatchDoomKey("keydown", mapped);
    },
    true,
  );

  window.addEventListener(
    "keyup",
    (event) => {
      if (!event.isTrusted) return;
      const mapped = doomKeyMap[event.key.toLowerCase()];
      if (!mapped || mapped.code === event.code) return;
      event.preventDefault();
      dispatchDoomKey("keyup", mapped);
    },
    true,
  );

  window.addEventListener("message", (event) => {
    if (event.data !== "resume-game") return;
    resumeGame();
  });

  const script = document.createElement("script");
  script.src = "/games/doom/websockets-doom.js";
  script.async = true;
  document.body.appendChild(script);
}

setupMobileControls();
startDoom();

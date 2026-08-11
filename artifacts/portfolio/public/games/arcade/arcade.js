(() => {
  const params = new URLSearchParams(location.search);
  const mode = params.get("game") === "diamond" ? "diamond" : "bounce";
  const canvas = document.querySelector("#game");
  const ctx = canvas?.getContext("2d");
  const title = document.querySelector("#title");
  const scoreEl = document.querySelector("#score");
  const statusEl = document.querySelector("#status");
  const messageEl = document.querySelector("#message");
  const restartButton = document.querySelector("#restart");
  const keys = new Set();

  if (!canvas || !ctx || !title || !scoreEl || !statusEl || !messageEl) {
    document.body.textContent = "Arcade failed to initialize.";
    return;
  }

  const W = canvas.width;
  const H = canvas.height;
  const worldWidth = mode === "bounce" ? 3420 : 2880;
  let raf = 0;
  let lastTime = 0;
  let score = 0;
  let camera = 0;
  let gameOver = false;
  let won = false;
  let state = createState();

  title.textContent = mode === "bounce" ? "BOUNCE CLASSIC" : "DIAMOND RUSH";
  statusEl.textContent = "READY";

  function createState() {
    return mode === "bounce" ? createBounceState() : createDiamondState();
  }

  function createBounceState() {
    const platforms = [
      { x: 0, y: 492, w: 430, h: 42 },
      { x: 520, y: 432, w: 220, h: 26 },
      { x: 820, y: 372, w: 245, h: 26 },
      { x: 1160, y: 454, w: 260, h: 26 },
      { x: 1510, y: 394, w: 245, h: 26 },
      { x: 1840, y: 330, w: 230, h: 26 },
      { x: 2170, y: 426, w: 260, h: 26 },
      { x: 2520, y: 370, w: 250, h: 26 },
      { x: 2880, y: 472, w: 430, h: 42 },
    ];
    const gems = platforms.flatMap((platform, i) =>
      i === 0
        ? []
        : [
            { x: platform.x + platform.w * 0.35, y: platform.y - 42, r: 11, got: false },
            { x: platform.x + platform.w * 0.66, y: platform.y - 62, r: 11, got: false },
          ],
    );
    const hazards = [
      { x: 455, y: 504, w: 44, h: 30 },
      { x: 1096, y: 496, w: 44, h: 38 },
      { x: 1450, y: 496, w: 44, h: 38 },
      { x: 2098, y: 496, w: 44, h: 38 },
      { x: 2795, y: 496, w: 44, h: 38 },
    ];
    return {
      player: { x: 118, y: 438, vx: 0, vy: 0, r: 20, grounded: false },
      platforms,
      gems,
      hazards,
      finish: { x: 3195, y: 374, w: 38, h: 118 },
    };
  }

  function createDiamondState() {
    const blocks = [];
    for (let x = 0; x <= worldWidth; x += 96) blocks.push({ x, y: 484, w: 96, h: 56 });
    [
      [260, 398, 180],
      [560, 338, 190],
      [900, 406, 160],
      [1160, 326, 210],
      [1510, 410, 150],
      [1770, 350, 190],
      [2090, 392, 180],
      [2380, 326, 210],
    ].forEach(([x, y, w]) => blocks.push({ x, y, w, h: 28 }));
    const gems = [
      { x: 332, y: 356, got: false },
      { x: 642, y: 296, got: false },
      { x: 970, y: 364, got: false },
      { x: 1260, y: 284, got: false },
      { x: 1850, y: 308, got: false },
      { x: 2480, y: 284, got: false },
    ];
    const traps = [
      { x: 760, y: 456, w: 76, h: 28 },
      { x: 1380, y: 456, w: 76, h: 28 },
      { x: 1980, y: 456, w: 76, h: 28 },
    ];
    return {
      player: { x: 90, y: 430, vx: 0, vy: 0, w: 28, h: 34, grounded: false },
      blocks,
      gems,
      traps,
      exit: { x: 2715, y: 392, w: 54, h: 92 },
    };
  }

  function restart() {
    cancelAnimationFrame(raf);
    keys.clear();
    score = 0;
    camera = 0;
    gameOver = false;
    won = false;
    lastTime = 0;
    state = createState();
    messageEl.hidden = true;
    statusEl.textContent = "READY";
    raf = requestAnimationFrame(frame);
  }

  function down(...names) {
    return names.some((name) => keys.has(name));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function rectsHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function end(text, didWin = false) {
    gameOver = true;
    won = didWin;
    statusEl.textContent = didWin ? "CLEAR" : "CRASH-FREE GAME OVER";
    messageEl.textContent = `${text}\nSCORE ${String(score).padStart(6, "0")}\nPRESS RESTART`;
    messageEl.hidden = false;
  }

  function updateBounce(dt) {
    const p = state.player;
    const left = down("ArrowLeft", "KeyA", "a");
    const right = down("ArrowRight", "KeyD", "d");
    const jump = down("ArrowUp", "KeyW", "w", "Space", " ");

    p.vx += (Number(right) - Number(left)) * 1120 * dt;
    p.vx *= p.grounded ? 0.86 : 0.96;
    p.vx = clamp(p.vx, -330, 330);
    if (jump && p.grounded) p.vy = -720;
    p.vy += 1320 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.grounded = false;

    for (const platform of state.platforms) {
      const wasAbove = p.y + p.r - p.vy * dt <= platform.y + 8;
      const overlapsX = p.x + p.r > platform.x && p.x - p.r < platform.x + platform.w;
      if (p.vy >= 0 && wasAbove && overlapsX && p.y + p.r >= platform.y && p.y + p.r <= platform.y + platform.h + 18) {
        p.y = platform.y - p.r;
        p.vy = -500;
        p.grounded = true;
      }
    }

    for (const gem of state.gems) {
      if (!gem.got && Math.hypot(p.x - gem.x, p.y - gem.y) < p.r + gem.r) {
        gem.got = true;
        score += 150;
      }
    }

    for (const hazard of state.hazards) {
      if (p.x + p.r > hazard.x && p.x - p.r < hazard.x + hazard.w && p.y + p.r > hazard.y && p.y - p.r < hazard.y + hazard.h) {
        end("SPIKES GOT YOU");
      }
    }

    if (p.y > H + 90) end("TOO LOW");
    if (p.x + p.r > state.finish.x && p.y + p.r > state.finish.y) end("STAGE CLEAR", true);
    p.x = clamp(p.x, 40, worldWidth - 40);
    camera = clamp(p.x - 290, 0, worldWidth - W);
  }

  function updateDiamond(dt) {
    const p = state.player;
    const left = down("ArrowLeft", "KeyA", "a");
    const right = down("ArrowRight", "KeyD", "d");
    const jump = down("ArrowUp", "KeyW", "w", "Space", " ");

    p.vx += (Number(right) - Number(left)) * 980 * dt;
    p.vx *= p.grounded ? 0.82 : 0.94;
    p.vx = clamp(p.vx, -285, 285);
    if (jump && p.grounded) {
      p.vy = -560;
      p.grounded = false;
    }
    p.vy += 1220 * dt;

    p.x += p.vx * dt;
    for (const block of state.blocks) {
      if (!rectsHit(p, block)) continue;
      if (p.vx > 0) p.x = block.x - p.w;
      if (p.vx < 0) p.x = block.x + block.w;
      p.vx = 0;
    }

    p.y += p.vy * dt;
    p.grounded = false;
    for (const block of state.blocks) {
      if (!rectsHit(p, block)) continue;
      if (p.vy > 0) {
        p.y = block.y - p.h;
        p.grounded = true;
      } else if (p.vy < 0) {
        p.y = block.y + block.h;
      }
      p.vy = 0;
    }

    for (const gem of state.gems) {
      if (!gem.got && Math.hypot(p.x + p.w / 2 - gem.x, p.y + p.h / 2 - gem.y) < 32) {
        gem.got = true;
        score += 200;
      }
    }

    for (const trap of state.traps) {
      if (rectsHit(p, trap)) end("CAVE TRAP");
    }

    if (rectsHit(p, state.exit)) {
      if (state.gems.every((gem) => gem.got)) end("TREASURE ROOM CLEARED", true);
      else statusEl.textContent = "COLLECT ALL GEMS";
    }

    if (p.y > H + 90) end("LOST IN THE CAVE");
    p.x = clamp(p.x, 20, worldWidth - 70);
    camera = clamp(p.x - 310, 0, worldWidth - W);
  }

  function drawBackground(top, bottom) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    for (let i = 0; i < 32; i += 1) {
      const x = (i * 151 - camera * 0.28) % (W + 180);
      ctx.fillRect(x - 90, 72 + (i % 7) * 54, 96, 3);
    }
  }

  function drawBounce() {
    drawBackground("#182057", "#6e315a");
    ctx.save();
    ctx.translate(-camera, 0);
    ctx.fillStyle = "#ffd14a";
    for (const p of state.platforms) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#171719";
      ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
      ctx.fillStyle = "#ffd14a";
    }
    ctx.fillStyle = "#ff4f68";
    for (const h of state.hazards) {
      for (let x = h.x; x < h.x + h.w; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, h.y + h.h);
        ctx.lineTo(x + 7, h.y);
        ctx.lineTo(x + 14, h.y + h.h);
        ctx.fill();
      }
    }
    for (const g of state.gems) {
      if (g.got) continue;
      ctx.fillStyle = "#6ef0df";
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = won ? "#6ef0df" : "#fff";
    ctx.fillRect(state.finish.x, state.finish.y, state.finish.w, state.finish.h);
    ctx.fillStyle = "#171719";
    ctx.fillRect(state.finish.x + 8, state.finish.y + 18, 22, 12);

    const p = state.player;
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#171719";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#171719";
    ctx.beginPath();
    ctx.arc(p.x - 7, p.y - 5, 3, 0, Math.PI * 2);
    ctx.arc(p.x + 7, p.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDiamond() {
    drawBackground("#201b36", "#070711");
    ctx.save();
    ctx.translate(-camera, 0);
    ctx.fillStyle = "#5b467d";
    for (const b of state.blocks) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#8067a9";
      ctx.lineWidth = 3;
      ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
    }
    ctx.fillStyle = "#ce4f5a";
    for (const t of state.traps) {
      ctx.beginPath();
      ctx.moveTo(t.x, t.y + t.h);
      ctx.lineTo(t.x + t.w / 2, t.y);
      ctx.lineTo(t.x + t.w, t.y + t.h);
      ctx.fill();
    }
    for (const g of state.gems) {
      if (g.got) continue;
      ctx.fillStyle = "#65eadb";
      ctx.beginPath();
      ctx.moveTo(g.x, g.y - 16);
      ctx.lineTo(g.x + 14, g.y);
      ctx.lineTo(g.x, g.y + 16);
      ctx.lineTo(g.x - 14, g.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = state.gems.every((gem) => gem.got) ? "#f7cf45" : "#8b5847";
    ctx.fillRect(state.exit.x, state.exit.y, state.exit.w, state.exit.h);
    ctx.fillStyle = "#171719";
    ctx.fillRect(state.exit.x + 18, state.exit.y + 28, 18, 22);

    const p = state.player;
    ctx.fillStyle = "#f7cf45";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = "#171719";
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#171719";
    ctx.fillRect(p.x + 7, p.y + 9, 4, 4);
    ctx.fillRect(p.x + 18, p.y + 9, 4, 4);
    ctx.restore();
  }

  function drawHud() {
    scoreEl.textContent = String(score).padStart(6, "0");
    if (!gameOver && statusEl.textContent !== "COLLECT ALL GEMS") {
      statusEl.textContent = mode === "bounce" ? "ROLLING" : "EXPLORING";
    }
  }

  function draw() {
    mode === "bounce" ? drawBounce() : drawDiamond();
    drawHud();
  }

  function frame(time) {
    try {
      const dt = Math.min(0.034, (time - lastTime) / 1000 || 0);
      lastTime = time;
      if (!gameOver) {
        mode === "bounce" ? updateBounce(dt) : updateDiamond(dt);
      }
      draw();
      raf = requestAnimationFrame(frame);
    } catch (error) {
      console.error(error);
      end("ARCADE ERROR");
    }
  }

  function addKey(event) {
    keys.add(event.key);
    keys.add(event.code);
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
  }

  function removeKey(event) {
    keys.delete(event.key);
    keys.delete(event.code);
  }

  addEventListener("keydown", addKey);
  addEventListener("keyup", removeKey);
  addEventListener("message", (event) => {
    if (event.data === "resume-game") canvas.focus();
  });

  document.querySelectorAll("[data-key]").forEach((button) => {
    const key = button.dataset.key;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      keys.add(key);
      button.setPointerCapture?.(event.pointerId);
      canvas.focus();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => {
      button.addEventListener(type, () => keys.delete(key));
    });
  });

  restartButton?.addEventListener("click", restart);
  canvas.addEventListener("pointerdown", () => canvas.focus());
  canvas.focus();
  draw();
  raf = requestAnimationFrame(frame);
})();

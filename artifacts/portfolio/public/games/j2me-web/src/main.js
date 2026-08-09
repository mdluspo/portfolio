import { LibMedia } from "../libmedia/libmedia.js";
import { LibMidi, createUnlockingAudioContext } from "../libmidi/libmidi.js";
import { codeMap, KeyRepeatManager } from "./key.js";
import { EventQueue } from "./eventqueue.js";
import { initKbdListeners, setKbdHandler, kbdWidth, kbdHeight } from "./screenKbd.js";

// we need to import natives here, don't use System.loadLibrary
// since CheerpJ fails to load them in firefox and we can't set breakpoints
import canvasFontNatives from "../libjs/libcanvasfont.js";
import canvasGraphicsNatives from "../libjs/libcanvasgraphics.js";
import gles2Natives from "../libjs/libgles2.js";
import jsReferenceNatives from "../libjs/libjsreference.js";
import mediaBridgeNatives from "../libjs/libmediabridge.js";
import midiBridgeNatives from "../libjs/libmidibridge.js";

const evtQueue = new EventQueue();
const sp = new URLSearchParams(location.search);

const cheerpjWebRoot = '/app'+location.pathname.replace(/\/[^/]*$/,'');

let isMobile = sp.get('mobile');

let display = null;
let screenCtx = null;

let fractionScale = sp.get('fractionScale') || (localStorage && localStorage.getItem("pl.zb3.freej2me.fractionScale") === "true");
let scaleSet = false;

const keyRepeatManager = new KeyRepeatManager();
let lastTouchPoint = null;

window.evtQueue = evtQueue;

function displayPointFromClient(clientX, clientY) {
    const rect = display.getBoundingClientRect();
    const scaleX = screenCtx.canvas.width / Math.max(1, rect.width);
    const scaleY = screenCtx.canvas.height / Math.max(1, rect.height);

    return {
        x: Math.max(0, Math.min(screenCtx.canvas.width - 1, (clientX - rect.left) * scaleX)) | 0,
        y: Math.max(0, Math.min(screenCtx.canvas.height - 1, (clientY - rect.top) * scaleY)) | 0,
    };
}

function autoscale() {
    if (!scaleSet) return;

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    if (isMobile) {
        document.getElementById('left-keys').style.display = '';
        document.getElementById('right-keys').style.display = '';

        if (screenWidth > screenHeight) {
            document.body.classList.add('kbd-landscape');
            document.body.classList.remove('kbd-portrait');
        } else {
            document.body.classList.add('kbd-portrait');
            document.body.classList.remove('kbd-landscape');
        }
    }

    let scale = Math.min(
        screenWidth/screenCtx.canvas.width,
        screenHeight/screenCtx.canvas.height
    );

    if (!fractionScale) {
        scale = scale|0;
    }

    display.style.zoom = scale;
}

function setListeners() {
    let mouseDown = false;
    let noMouse = false;

    setKbdHandler((isDown, key) => {
        const symbol = key.startsWith('Digit') ? key.substring(5) : '\x00';
        keyRepeatManager.post(isDown, key, {symbol, ctrlKey: false, shiftKey: false});
    });

    function handleKeyEvent(e) {
        const isDown = e.type === 'keydown';
        const mappedCode = {
            KeyW: 'ArrowUp',
            KeyA: 'ArrowLeft',
            KeyS: 'ArrowDown',
            KeyD: 'ArrowRight',
        }[e.code] || e.code;

        if (codeMap[mappedCode]) {
            keyRepeatManager.post(isDown, mappedCode, {
                symbol: e.key.length == 1 ? e.key.charCodeAt(0) : '\x00',
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey
            })
        }
        e.preventDefault();
    }

    display.addEventListener('keydown', handleKeyEvent);
    display.addEventListener('keyup', handleKeyEvent);

    keyRepeatManager.register((kind, key, args) => {
        if (kind === 'click') {
            if (key === 'Maximize') {
                fractionScale = !fractionScale;
                localStorage && localStorage.setItem("pl.zb3.freej2me.fractionScale", fractionScale);
                autoscale();
            }
        } else if (codeMap[key]) {
            console.log('queuin event');
            evtQueue.queueEvent({
                kind: kind === 'up' ? 'keyup' : 'keydown',
                args: [codeMap[key], args.symbol, args.ctrlKey, args.shiftKey]
            });
        }
    });

    display.addEventListener('mousedown', async e => {
        display.focus();
        if (noMouse) return;
        const point = displayPointFromClient(e.clientX, e.clientY);

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: point.x,
            y: point.y,
        });

        mouseDown = true;

        e.preventDefault();
    });

    display.addEventListener('mousemove', async e => {
        if (noMouse) return;
        if (!mouseDown) return;
        const point = displayPointFromClient(e.clientX, e.clientY);

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    });

    document.addEventListener('mouseup', async e => {
        if (noMouse) return;
        if (!mouseDown) return;

        mouseDown = false;
        const point = displayPointFromClient(e.clientX, e.clientY);

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    });


    display.addEventListener('touchstart', async e => {
        display.focus();
        noMouse = true;
        const touch = e.changedTouches[0];
        if (!touch) return;
        const point = displayPointFromClient(touch.clientX, touch.clientY);
        lastTouchPoint = point;

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchmove', async e => {
        noMouse = true;
        const touch = e.changedTouches[0];
        if (!touch) return;
        const point = displayPointFromClient(touch.clientX, touch.clientY);
        lastTouchPoint = point;

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchend', async e => {
        noMouse = true;
        const touch = e.changedTouches[0];
        const point = touch ? displayPointFromClient(touch.clientX, touch.clientY) : lastTouchPoint;
        if (!point) return;
        lastTouchPoint = null;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchcancel', async e => {
        noMouse = true;
        const touch = e.changedTouches[0];
        const point = touch ? displayPointFromClient(touch.clientX, touch.clientY) : lastTouchPoint;
        if (!point) return;
        lastTouchPoint = null;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: point.x,
            y: point.y,
        });

        e.preventDefault();
    }, {passive: false});

    document.addEventListener('mousedown', e => {
        console.log('refocus');
        setTimeout(() => display.focus(), 20);
        ;
    });

    display.addEventListener('blur', e => {
        console.log('refocus');
        // it doesn't work without any timeout
        setTimeout(() => display.focus(), 10);
        ;
    });

    window.addEventListener('resize', autoscale);

    initKbdListeners();
}

function setFaviconFromBuffer(arrayBuffer) {
    const blob = new Blob([arrayBuffer], { type: 'image/png' });

    const reader = new FileReader();
    reader.onload = function() {
        const dataURL = reader.result;

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'icon');
            document.head.appendChild(link);
        }
        link.setAttribute('href', dataURL);
    };
    reader.readAsDataURL(blob);
}

async function ensureAppInstalled(lib, appId) {
    const appFile = await cjFileBlob(appId + "/app.jar");

    if (!appFile) {
        const launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

        await launcherUtil.installFromBundle(cheerpjWebRoot + "/apps/", appId);
    }
}

async function init() {
    document.getElementById("loading").textContent = "Loading CheerpJ...";

    display = document.getElementById('display');
    screenCtx = display.getContext('2d');

    setListeners();

    window.libmidi = new LibMidi(createUnlockingAudioContext());
    await window.libmidi.init();
    window.libmidi.midiPlayer.addEventListener('end-of-media', e => {
        window.evtQueue.queueEvent({kind: 'player-eom', player: e.target});
    })
    window.libmedia = new LibMedia();

    await cheerpjInit({
        enableDebug: false,
        natives: {
            ...canvasFontNatives,
            ...canvasGraphicsNatives,
            ...gles2Natives,
            ...jsReferenceNatives,
            ...mediaBridgeNatives,
            ...midiBridgeNatives,
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setTitle(lib, title) {
                document.title = title;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setIcon(lib, iconBytes) {
                if (iconBytes) {
                    setFaviconFromBuffer(iconBytes.buffer);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_getScreenCtx(lib) {
                return screenCtx;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setCanvasSize(lib, width, height) {
                if (!scaleSet) {
                    document.getElementById('loading').hidden = true;
                    display.style.display = '';
                    scaleSet = true;
                    display.focus();
                }
                screenCtx.canvas.width = width;
                screenCtx.canvas.height = height;
                autoscale();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_waitForAndDispatchEvents(lib, listener) {
                const KeyEvent = await lib.pl.zb3.freej2me.bridge.shell.KeyEvent;
                const PointerEvent = await lib.pl.zb3.freej2me.bridge.shell.PointerEvent;

                const evt = await evtQueue.waitForEvent();
                if (evt.kind == 'keydown') {
                    await listener.keyPressed(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'keyup') {
                    await listener.keyReleased(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'pointerpressed') {
                    await listener.pointerPressed(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerdragged') {
                    await listener.pointerDragged(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerreleased') {
                    await listener.pointerReleased(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'player-eom') {
                    await listener.playerEOM(evt.player);
                } else if (evt.kind == 'player-video-frame') {
                    await listener.playerVideoFrame(evt.player);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_restart(lib) {
                location.reload();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_exit(lib) {
                location.href = './';
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sthop(lib) {
                debugger;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_say(lib, sth) {
                console.log('[say]', sth);
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sayObject(lib, label, obj) {
                debugger;
                console.log('[sayobject]', label, obj);
            }
        }
    });

    document.getElementById("loading").textContent = "Loading...";

    const lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    const FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME;

    let args;

    if (sp.get('app')) {
        const app = sp.get('app');
        await ensureAppInstalled(lib, app);

        args = ['app', sp.get('app')];
    } else {
        args = ['jar', cheerpjWebRoot+"/jar/" + (sp.get('jar') || "game.jar")];
    }

    FreeJ2ME.main(args).catch(e => {
        console.error(e);
        if (e && typeof e.printStackTrace === 'function') {
            e.printStackTrace();
        }
        const message = e?.message || e?.toString?.() || 'Unknown error';
        document.getElementById('loading').hidden = false;
        document.getElementById('loading').textContent = `Crash: ${message}`;
    });


}

init();

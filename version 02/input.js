function makeRotatable(knobId, outputId, { min, max, value, step }) {
    const knob = document.getElementById(knobId);
    const output = document.getElementById(outputId);

    let isDragging = false;
    let centerX, centerY;
    let currentValue = value;

    // Update display
    function updateDisplay() {
        const rounded = parseFloat(currentValue.toFixed(2));
        knob.style.transform = `rotate(${rounded}deg)`;
        output.textContent = rounded;
    }


    // Get angle from mouse/touch
    function getAngle(x, y) {
        const dx = x - centerX;
        const dy = y - centerY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Drag start
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        const rect = knob.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    }

    // Drag move
    function duringDrag(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let angle = getAngle(clientX, clientY);

        // Convert to 0–360 range
        if (angle < 0) angle += 360;

        // Map angle to min–max
        let newValue = Math.round(angle / step) * step;
        newValue = Math.max(min, Math.min(max, newValue));

        currentValue = newValue;
        updateDisplay();
    }

    // Drag end
    function endDrag() {
        isDragging = false;
    }

    knob.addEventListener('mousedown', startDrag);
    knob.addEventListener('touchstart', startDrag);
    window.addEventListener('mousemove', duringDrag);
    window.addEventListener('touchmove', duringDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    updateDisplay();
}

// Example usage
makeRotatable("dial00", "dial00-value", {
    min: 0,
    max: 360,
    value: 90,
    step: 0.1
});

makeRotatable("dial01", "dial01-value", {
    min: 0,
    max: 360,
    value: 90,
    step: 0.1
});

makeRotatable("dial02", "dial02-value", {
    min: 0,
    max: 360,
    value: 90,
    step: 0.1,
});

import Peer from 'https://esm.sh/peerjs@1.5.2?target=es2020';
const TARGET_ID = 'three-output-001'; // must match output page

const sx1 = document.getElementById("dial00-value");
const sy1 = document.getElementById("dial01-value");
const sz1 = document.getElementById("dial02-value");

function getValues() {
    return {
        x: Number(sx1?.value ?? 0),
        y: Number(sy1?.value ?? 0),
        z: Number(sz1?.value ?? 0),
    };
}

let conn = null;

// Connect PeerJS
const peer = new Peer(undefined, {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
});

peer.on('open', id => {
    console.log('[INPUT] Peer open:', id);
    conn = peer.connect(TARGET_ID, { reliable: true });

    conn.on('open', () => {
        console.log('[INPUT] Connected to', TARGET_ID);
        conn.send(getValues()); // send initial
    });
});

peer.on('error', err => console.error('[INPUT] Peer error:', err));

let rafPending = false;
function queueSend() {
    if (!conn || !conn.open) return;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
        rafPending = false;
        conn.send(getValues());
    });
}

[sx, sy, sz].forEach(el => {
    el?.addEventListener('input', queueSend);
    el?.addEventListener('change', queueSend);
});
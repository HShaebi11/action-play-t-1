import Peer from 'https://esm.sh/peerjs@1.5.2?target=es2020';

const TARGET_ID = 'three-output-001'; // must match the output page

// Find sliders by their name attributes
const sx = document.querySelector('input[name="postion-x"]');
const sy = document.querySelector('input[name="postion-y"]');
const sz = document.querySelector('input[name="postion-z"]');

function getValues() {
  return {
    x: Number(sx?.value ?? 0),
    y: Number(sy?.value ?? 0),
    z: Number(sz?.value ?? 0),
  };
}

let conn = null;

// Create our own peer with a random ID and then connect
const peer = new Peer();
peer.on('open', id => {
  console.log('[INPUT] Peer open with id:', id);
  conn = peer.connect(TARGET_ID, { reliable: true });

  conn.on('open', () => {
    console.log('[INPUT] Connected to output:', TARGET_ID);
    // Send initial values once connected
    conn.send(getValues());
  });

  conn.on('error', err => console.error('[INPUT] Conn error:', err));
  conn.on('close', () => console.log('[INPUT] Conn closed'));
});

peer.on('error', err => console.error('[INPUT] Peer error:', err));

// Throttle sends so we don’t spam the channel
let rafPending = false;
function queueSend() {
  if (!conn || conn.open !== true) return;
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    conn.send(getValues());
  });
}

// Listen to slider changes
[sx, sy, sz].forEach(el => {
  if (!el) return;
  el.addEventListener('input', queueSend);
  el.addEventListener('change', queueSend);
});
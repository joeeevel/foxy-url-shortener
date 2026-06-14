/* ─── DOM refs ─── */
const $ = (id) => document.getElementById(id);
const led = $('statusLed');
const encryptView = $('encryptView');
const decryptView = $('decryptView');
const urlInput = $('urlInput');
const encryptBtn = $('encryptBtn');
const resultArea = $('resultArea');
const decryptStatus = $('decryptStatus');

/* ─── Text <-> Buffer utils ─── */
function strToBuf(s) {
  return new TextEncoder().encode(s);
}

function bufToStr(b) {
  return new TextDecoder().decode(b);
}

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function toBase64Url(s) {
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return s;
}

/* ─── Set LED state ─── */
function setLed(state) {
  led.className = 'led';
  if (state === 'secure') led.classList.add('secure');
}

/* ─── Encrypt ─── */
async function encryptUrl(plaintext) {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = strToBuf(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyB64 = toBase64Url(bufToBase64(exportedKey));
  const ivB64 = toBase64Url(bufToBase64(iv));
  const payloadB64 = toBase64Url(bufToBase64(ciphertext));

  return { key: keyB64, iv: ivB64, payload: payloadB64 };
}

/* ─── Decrypt ─── */
async function decryptPayload(keyB64, ivB64, payloadB64) {
  const keyBytes = base64ToBuf(fromBase64Url(keyB64));
  const iv = new Uint8Array(base64ToBuf(fromBase64Url(ivB64)));
  const ciphertext = base64ToBuf(fromBase64Url(payloadB64));

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return bufToStr(plaintext);
}

/* ─── Encrypt flow ─── */
encryptBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) return;

  encryptBtn.disabled = true;
  encryptBtn.textContent = 'Encrypting...';
  setLed('idle');

  try {
    const result = await encryptUrl(url);

    const res = await fetch('/krypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: result.payload }),
    });

    if (!res.ok) throw new Error('Server error');

    const data = await res.json();
    const shortUrl = `${window.location.origin}/q/${data.id}#${result.key}.${result.iv}`;

    setLed('secure');

    resultArea.innerHTML = `
      <div class="result-box secure">
        <div class="label">Encrypted Link</div>
        <div class="url" id="shortUrl">${escHtml(shortUrl)}</div>
      </div>
      <div class="result-box" style="margin-top:0.5rem;font-size:0.75rem;word-break:break-all;">
        <div class="label">Encrypted Payload (server never sees the original)</div>
        <textarea readonly rows="2">${escHtml(result.payload)}</textarea>
      </div>
    `;

    document.getElementById('shortUrl').addEventListener('click', () => {
      navigator.clipboard.writeText(shortUrl).then(() => {
        const old = encryptBtn.textContent;
        encryptBtn.textContent = 'Copied!';
        setTimeout(() => { encryptBtn.textContent = old; }, 1500);
      });
    });

    urlInput.value = '';
  } catch (err) {
    resultArea.innerHTML = `<div class="result-box" style="border-left-color:#e85555;">Error: ${escHtml(err.message)}</div>`;
  } finally {
    encryptBtn.disabled = false;
    encryptBtn.textContent = 'Encrypt & Trim';
  }
});

/* ─── Decrypt flow (on page load) ─── */
(async function init() {
  const pathMatch = window.location.pathname.match(/^\/q\/([^/]+)$/);
  if (!pathMatch) return;

  const id = pathMatch[1];
  const hash = window.location.hash.replace(/^#/, '');

  if (!hash || !hash.includes('.')) {
    decryptStatus.innerHTML = `<p style="color:#e85555;">Error: Missing decryption key in URL hash.</p>`;
    showDecryptView();
    return;
  }

  const [keyB64, ivB64] = hash.split('.');

  showDecryptView();

  try {
    const res = await fetch(`/api/krypt/${id}`);
    if (!res.ok) throw new Error('Link not found');

    const data = await res.json();
    const originalUrl = await decryptPayload(keyB64, ivB64, data.payload);

    setTimeout(() => {
      decryptStatus.innerHTML = `<p style="color:#30d158;">Secure link verified. Redirecting...</p>`;
      setTimeout(() => {
        window.location.href = originalUrl;
      }, 600);
    }, 400);

  } catch (err) {
    decryptStatus.innerHTML = `
      <p style="color:#e85555;">Decryption failed</p>
      <p style="font-size:0.8rem;color:#6a6864;margin-top:0.5rem;">${escHtml(err.message)}</p>
      <button class="btn" style="margin-top:1.5rem;width:auto;display:inline-block;padding:0.5rem 1.5rem;" onclick="window.location.href='/krypt'">Back to KryptTrim</button>
    `;
  }
})();

function showDecryptView() {
  encryptView.classList.add('hidden');
  decryptView.classList.remove('hidden');
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

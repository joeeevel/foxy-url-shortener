let currentPage = 1;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  loadUrls();
  document.getElementById('create-form').addEventListener('submit', onCreate);
  document.getElementById('search').addEventListener('input', onSearch);
  document.getElementById('copy-btn').addEventListener('click', onCopy);
  document.getElementById('open-btn').addEventListener('click', onOpen);
  document.getElementById('close-modal').addEventListener('click', () => closeModal('stats-modal'));
  document.getElementById('stats-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('stats-modal');
  });
});

function getBase() {
  return `${window.location.protocol}//${window.location.host}`;
}

function $(id) { return document.getElementById(id); }

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function closeModal(id) { $(id).classList.add('hidden'); }

function toast(msg, type) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type || '');
  show('toast');
  setTimeout(() => hide('toast'), 3000);
}

async function loadUrls() {
  show('loading');
  hide('empty');
  hide('table-wrap');

  try {
    const params = new URLSearchParams({ page: currentPage });
    if (currentSearch) params.set('search', currentSearch);

    const res = await fetch(`/api/urls?${params}`);
    const data = await res.json();

    hide('loading');

    if (!data.urls || data.urls.length === 0) {
      show('empty');
      $('total-count').textContent = '';
      return;
    }

    show('table-wrap');
    $('total-count').textContent = `${data.total} link${data.total !== 1 ? 's' : ''}`;
    renderUrls(data.urls);
    renderPagination(data.page, data.pages);
  } catch {
    hide('loading');
    show('empty');
    $('empty').textContent = 'Failed to load links.';
  }
}

function renderUrls(urls) {
  const tbody = $('urls-body');
  tbody.innerHTML = '';

  for (const u of urls) {
    const tr = document.createElement('tr');
    const shortUrl = `${getBase()}/${u.shortCode}`;
    const created = new Date(u.createdAt).toLocaleDateString();

    tr.innerHTML = `
      <td><a href="${shortUrl}" target="_blank">${u.shortCode}</a></td>
      <td><span class="orig" title="${esc(u.originalUrl)}">${esc(u.originalUrl)}</span></td>
      <td class="num">${u.clicks}</td>
      <td>${created}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="copyText('${shortUrl}')">Copy</button>
          <button class="btn-sm" onclick="showStats('${u.shortCode}')">Stats</button>
          <button class="btn-sm btn-del" onclick="deleteUrl('${u.shortCode}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function renderPagination(page, pages) {
  const el = $('pagination');
  el.innerHTML = '';

  if (pages <= 1) return;

  const prev = document.createElement('button');
  prev.textContent = '←';
  prev.disabled = page <= 1;
  prev.addEventListener('click', () => { currentPage = page - 1; loadUrls(); });
  el.appendChild(prev);

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === page) btn.classList.add('active');
    btn.addEventListener('click', () => { currentPage = i; loadUrls(); });
    el.appendChild(btn);
  }

  const next = document.createElement('button');
  next.textContent = '→';
  next.disabled = page >= pages;
  next.addEventListener('click', () => { currentPage = page + 1; loadUrls(); });
  el.appendChild(next);
}

let searchTimeout;

function onSearch(e) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadUrls();
  }, 300);
}

async function onCreate(e) {
  e.preventDefault();
  const url = $('url').value.trim();
  const custom = $('custom-code').value.trim();
  const btn = $('create-btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const body = custom ? { url, customCode: custom } : { url };
    const res = await fetch('/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      toast(data.error || 'Error', 'error');
      return;
    }

    const shortUrl = `${window.location.protocol}//${window.location.host}/${data.shortCode}`;
    $('short-url').value = shortUrl;
    show('result');
    $('url').value = '';
    $('custom-code').value = '';
    toast('Short URL created!');
    loadUrls();
  } catch {
    toast('Network error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Shorten';
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('Copied!'), () => toast('Failed to copy', 'error'));
}

function onCopy() {
  copyText($('short-url').value);
}

function onOpen() {
  const url = $('short-url').value;
  if (url) window.open(url, '_blank');
}

async function showStats(shortCode) {
  try {
    const res = await fetch(`/stats/${shortCode}`);
    const data = await res.json();

    if (!res.ok) {
      toast(data.error || 'Not found', 'error');
      return;
    }

    const shortUrl = `${getBase()}/${shortCode}`;
    const created = new Date(data.createdAt).toLocaleString();
    const accessed = new Date(data.lastAccessed).toLocaleString();

    $('stats-body').innerHTML = `
      <div class="stat-row"><span class="stat-label">Short Code</span><span class="stat-value">${esc(shortCode)}</span></div>
      <div class="stat-row"><span class="stat-label">Original URL</span><span class="stat-value">${esc(data.originalUrl)}</span></div>
      <div class="stat-row"><span class="stat-label">Short URL</span><span class="stat-value">${esc(shortUrl)}</span></div>
      <div class="stat-row"><span class="stat-label">Clicks</span><span class="stat-value">${data.clicks}</span></div>
      <div class="stat-row"><span class="stat-label">Created</span><span class="stat-value">${created}</span></div>
      <div class="stat-row"><span class="stat-label">Last Accessed</span><span class="stat-value">${accessed}</span></div>
    `;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shortUrl)}`;
    $('qr-code').innerHTML = `<img src="${qrUrl}" alt="QR Code for ${shortCode}">`;
    show('stats-modal');
  } catch {
    toast('Failed to load stats', 'error');
  }
}

async function deleteUrl(shortCode) {
  if (!confirm(`Delete ${shortCode}?`)) return;

  try {
    const res = await fetch(`/api/urls/${shortCode}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error || 'Error', 'error');
      return;
    }
    toast('Deleted!');
    loadUrls();
  } catch {
    toast('Network error', 'error');
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

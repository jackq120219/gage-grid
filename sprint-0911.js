(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once:true }) : fn();
  ready(() => {
    const ribbon = document.querySelector('.ribbon');
    let networkNote = document.querySelector('[data-network-note]');
    if (!networkNote && ribbon) {
      networkNote = document.createElement('span');
      networkNote.dataset.networkNote = 'true';
      ribbon.appendChild(networkNote);
    }
    const syncNetwork = () => {
      document.documentElement.dataset.network = navigator.onLine ? 'online' : 'offline';
      if (networkNote) networkNote.textContent = navigator.onLine ? '' : ' · OFFLINE: LIVE EVIDENCE MAY BE UNAVAILABLE';
    };
    syncNetwork();
    addEventListener('online', syncNetwork);
    addEventListener('offline', syncNetwork);

    const draftIds = ['projectType','siteSelect','powerReq','waterReq','wasteReq','gasReq','fiberReq','timeline','powerRedundancy','risk','growth','capitalExposure'];
    try {
      const saved = JSON.parse(localStorage.getItem('gage-grid-project-draft-v1') || 'null');
      if (saved?.draft && Date.now() - Number(saved.savedAt || 0) < 1000 * 60 * 60 * 24 * 14) {
        draftIds.forEach(id => {
          const el = document.getElementById(id);
          if (el && saved.draft[id] !== undefined && saved.draft[id] !== '') el.value = saved.draft[id];
        });
      }
    } catch {}
    const saveDraft = () => {
      const draft = Object.fromEntries(draftIds.map(id => [id, document.getElementById(id)?.value ?? '']));
      localStorage.setItem('gage-grid-project-draft-v1', JSON.stringify({ savedAt: Date.now(), draft }));
    };
    draftIds.forEach(id => document.getElementById(id)?.addEventListener('change', saveDraft));
    draftIds.forEach(id => document.getElementById(id)?.addEventListener('input', saveDraft));

    const advanced = document.querySelector('details.advanced');
    if (advanced) {
      advanced.open = localStorage.getItem('gage-grid-advanced-open') === '1';
      advanced.addEventListener('toggle', () => localStorage.setItem('gage-grid-advanced-open', advanced.open ? '1' : '0'));
    }

    addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName;
      if (event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(tag)) {
        event.preventDefault();
        document.getElementById('regSearch')?.focus();
      }
      if (event.key === 'Escape') {
        const dialog = document.getElementById('recordDialog');
        if (dialog?.open) dialog.close();
      }
    });
  });
})();

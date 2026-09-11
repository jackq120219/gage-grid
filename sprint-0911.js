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
  });
})();

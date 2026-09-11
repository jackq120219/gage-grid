(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once:true }) : fn();
  ready(() => {
    document.documentElement.dataset.network = navigator.onLine ? 'online' : 'offline';
    addEventListener('online', () => document.documentElement.dataset.network = 'online');
    addEventListener('offline', () => document.documentElement.dataset.network = 'offline');
  });
})();

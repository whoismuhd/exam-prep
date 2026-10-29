/* ui.js – sayfa içi onay kutusu ve bildirim (tarayıcı confirm/alert yerine) */
(function () {
  'use strict';
  const t = (k, v) => I18n.t(k, v);

  function ensureHost() {
    let host = document.getElementById('modalHost');
    if (!host) { host = document.createElement('div'); host.id = 'modalHost'; document.body.appendChild(host); }
    return host;
  }

  /** Onay kutusu. Promise<boolean> döner. opts: {okLabel, cancelLabel, danger} */
  function confirmBox(message, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const host = ensureHost();
      const prev = document.activeElement;
      host.innerHTML = `
        <div class="modal-backdrop" data-close="1"></div>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalMsg">
          <p id="modalMsg">${Quiz.esc(message)}</p>
          <div class="btn-row">
            <button type="button" class="btn ${opts.danger ? 'btn-danger' : ''}" id="modalOk">${Quiz.esc(opts.okLabel || t('common.yes'))}</button>
            ${opts.cancelLabel === null ? '' : `<button type="button" class="btn btn-ghost" id="modalCancel">${Quiz.esc(opts.cancelLabel || t('common.no'))}</button>`}
          </div>
        </div>`;
      host.hidden = false;
      const done = v => { host.hidden = true; host.innerHTML = ''; document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); resolve(v); };
      const onKey = e => { if (e.key === 'Escape') done(false); };
      document.addEventListener('keydown', onKey);
      host.querySelector('#modalOk').addEventListener('click', () => done(true));
      const cancel = host.querySelector('#modalCancel'); if (cancel) cancel.addEventListener('click', () => done(false));
      host.querySelector('.modal-backdrop').addEventListener('click', () => done(false));
      host.querySelector('#modalOk').focus();
    });
  }

  /** Bilgi kutusu (tek düğme). */
  function notice(message) {
    return confirmBox(message, { okLabel: t('common.ok'), cancelLabel: null }).then(() => true);
  }

  window.UI = { confirm: confirmBox, notice };
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.cssText += open ? '' : 'position:absolute;top:68px;left:0;right:0;flex-direction:column;background:#020617;border-bottom:1px solid #273449;padding:10px 16px 18px;align-items:stretch;gap:2px;';
    });
  }

  document.querySelectorAll('.feature-card.expandable').forEach((card) => {
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.feature-card.expandable.open').forEach((c) => { if (c !== card) c.classList.remove('open'); });
      card.classList.toggle('open', !wasOpen);
    });
  });

  document.querySelectorAll('.role-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.role-tabs').dataset.group;
      document.querySelectorAll(`.role-tab[data-group="${group}"]`).forEach((t) => t.classList.remove('active'));
      document.querySelectorAll(`.role-panel[data-group="${group}"]`).forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.role-panel[data-group="${group}"][data-panel="${tab.dataset.panel}"]`).classList.add('active');
    });
  });
});

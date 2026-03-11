import { readFileSync, writeFileSync } from 'fs';

const path = 'public/admin/index.html';
const html = readFileSync(path, 'utf8');

const script = `
<script>
  (function () {
    const TINA_URL = /https:\\/\\/assets\\.tina\\.io\\/[^/]+\\//g;

    function patchElement(el) {
      if (el.dataset.tinaPatched) return;
      el.dataset.tinaPatched = 'true';

      // Replace displayed text
      el.childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = node.textContent.replace(TINA_URL, '/uploads/');
        }
      });

      // Intercept click-to-copy
      el.addEventListener('click', function (e) {
        const text = el.textContent.trim();
        navigator.clipboard.writeText(text);
        e.stopImmediatePropagation();
        e.preventDefault();
      }, true);
    }

    new MutationObserver(function () {
      document.querySelectorAll('span').forEach(function (el) {
        if (!el.dataset.tinaPatched && TINA_URL.test(el.textContent)) {
          TINA_URL.lastIndex = 0;
          patchElement(el);
        }
      });
    }).observe(document.body, { childList: true, subtree: true });
  })();
</script>`;

if (html.includes('tina-patched-urls')) {
  console.log('Admin index.html already patched, skipping.');
  process.exit(0);
}

const patched = html.replace('</body>', `<!-- tina-patched-urls -->${script}\n</body>`);
writeFileSync(path, patched);
console.log('Patched admin index.html with URL rewriter.');

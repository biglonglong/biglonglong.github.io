(function () {
  // 资源类型 badge 映射
  const badgeMap = [
    { prefix: /^video[-\s]/i,  cls: 'badge-video',  label: 'Video'  },
    { prefix: /^site[-\s]/i,   cls: 'badge-site',   label: 'Site'   },
    { prefix: /^book[-\s]/i,   cls: 'badge-book',   label: 'Book'   },
    { prefix: /^github[-\s]/i, cls: 'badge-github', label: 'GitHub' },
    { prefix: /^mooc[-\s]/i,   cls: 'badge-mooc',   label: 'MOOC'   },
    { prefix: /^blog[-\s]/i,   cls: 'badge-blog',   label: 'Blog'   },
  ];

  document.addEventListener('DOMContentLoaded', function () {
    const noProse = document.querySelector('.post-content.no-prose');
    if (!noProse) return;

    noProse.querySelectorAll('ul li a').forEach(function (a) {
      const text = a.textContent.trim();
      for (const { prefix, cls, label } of badgeMap) {
        if (prefix.test(text)) {
          // 去掉前缀（如 "Video - " 部分），保留剩余内容
          const cleanText = text.replace(/^[a-z]+[-\s]+/i, '');
          const badge = document.createElement('span');
          badge.className = 'res-badge ' + cls;
          badge.textContent = label;
          a.textContent = cleanText;
          a.prepend(badge);
          break;
        }
      }
    });
  });
})();

// ~/rayed contact popup overlay
// triggered by clicking "contact" in nav on ANY page, scatters branded windows + centered resume

(function () {
  'use strict';

  var CHANNELS = [
    {
      label: 'email', title: 'rahrayed@gmail.com', value: 'rahrayed@gmail.com',
      href: 'mailto:rahrayed@gmail.com',
      hook: 'YOU\'VE GOT MAIL!', sub: '1 new way to reach me',
      titleBg: 'var(--accent)', titleText: '#06120c',
      icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H3V6z" stroke="#06120c" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 7l8 6 8-6" stroke="#06120c" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      bigicon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H3V6z" stroke="#00ff88" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 7l8 6 8-6" stroke="#00ff88" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    },
    {
      label: 'github', title: 'github.com/rayedrah', value: 'github.com/rayedrah',
      href: 'https://github.com/rayedrah',
      hook: 'CODE LEAKED!', sub: 'click before it\'s patched',
      titleBg: '#ffffff', titleText: '#0d1117',
      icon: '<svg viewBox="0 0 24 24" fill="#0d1117"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.01 3.24 9.26 7.75 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.15.68-3.82-1.36-3.82-1.36-.52-1.3-1.26-1.65-1.26-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.24 3.3.94.1-.73.4-1.24.72-1.52-2.52-.29-5.16-1.26-5.16-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.74 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.36.77 1.07.77 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5z"/></svg>',
      bigicon: '<svg viewBox="0 0 24 24" fill="#e8e8e8"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.01 3.24 9.26 7.75 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.15.68-3.82-1.36-3.82-1.36-.52-1.3-1.26-1.65-1.26-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.24 3.3.94.1-.73.4-1.24.72-1.52-2.52-.29-5.16-1.26-5.16-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.74 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.36.77 1.07.77 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5z"/></svg>'
    },
    {
      label: 'linkedin', title: 'linkedin.com/in/rayedrah', value: 'linkedin.com/in/rayedrah',
      href: 'https://linkedin.com/in/rayedrah',
      hook: 'NEW CONNECTION!', sub: 'recruiters hate this trick',
      titleBg: '#0a66c2', titleText: '#ffffff',
      icon: '<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
      bigicon: '<svg viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>'
    },
    {
      label: 'instagram', title: 'instagram.com/rayedrah', value: 'instagram.com/rayedrah',
      href: 'https://instagram.com/rayedrah',
      hook: 'NEW FOLLOWER ALERT', sub: 'it could be you',
      titleBg: 'linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)', titleText: '#ffffff',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none"/></svg>',
      bigicon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fa7e1e" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="#fa7e1e" stroke="none"/></svg>'
    },
    {
      label: 'resume', title: 'CLASSIFIED: resume.pdf', value: 'resume.pdf',
      href: 'resume.pdf',
      hook: 'YOU WON\'T BELIEVE #4', sub: 'hiring managers hate him',
      titleBg: '#ffcc00', titleText: '#1a1a1a',
      focus: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2"><path d="M7 3h7l5 5v13H7V3z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16.5h6" /></svg>',
      bigicon: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="1.8"><path d="M7 3h7l5 5v13H7V3z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16.5h6" /></svg>'
    }
  ];

  function init() {
    var trigger = document.getElementById('contactTrigger');
    if (!trigger) return;

    var layer = document.createElement('div');
    layer.className = 'cw-layer';
    layer.id = 'cwLayer';
    document.body.appendChild(layer);

    var stopBtn = document.createElement('button');
    stopBtn.className = 'cw-stop';
    stopBtn.id = 'cwStop';
    stopBtn.type = 'button';
    stopBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
        '<line x1="12" y1="9" x2="12" y2="13"/>' +
        '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
      '</svg> NO SPAM';
    document.body.appendChild(stopBtn);

    var openWindows = [];
    var zCounter = 500;

    function getCardSize() {
      var w = window.innerWidth;
      if (w >= 1400) return 380;   // large desktop
      if (w >= 1024) return 340;   // laptop
      if (w >= 768)  return 310;   // tablet
      if (w > 480)   return 290;   // small tablet / large phone
      return w - 32;               // phone, fill width minus margin
    }

    function getFocusSize() {
      return getCardSize() + 50;
    }

    function centerPosition(focusWidth) {
      var winW = window.innerWidth;
      var winH = window.innerHeight;
      var w = winW > 480 ? focusWidth : winW - 32;
      var h = 300;
      var navClearance = 90;
      return {
        left: Math.max(8, (winW - w) / 2),
        top: Math.max(navClearance, (winH - h) / 2),
        rot: 0
      };
    }

    function randomScatter(index, total) {
      var winW = window.innerWidth;
      var winH = window.innerHeight;
      var navClearance = 90;
      var bottomClearance = 120; // room for the NO SPAM button
      var sideMargin = winW > 1024 ? 40 : 16;

      var cardW = getCardSize();
      var cardH = winW > 1024 ? 330 : 280;

      var usableW = winW - sideMargin * 2;
      var usableH = winH - navClearance - bottomClearance;

      var cols = Math.max(2, Math.min(total, Math.floor(usableW / (cardW + 20))));
      var rows = Math.max(1, Math.ceil(total / cols));

      var cellW = usableW / cols;
      var cellH = usableH / rows;

      var col = index % cols;
      var row = Math.floor(index / cols);

      var cellX = sideMargin + col * cellW;
      var cellY = navClearance + row * cellH;

      var jitterX = Math.random() * Math.max(0, cellW - cardW);
      var jitterY = Math.random() * Math.max(0, cellH - cardH);

      var left = cellX + jitterX;
      var top = cellY + jitterY;

      // hard clamp so nothing can ever clip off any edge of the viewport
      left = Math.min(Math.max(sideMargin, left), winW - cardW - sideMargin);
      top = Math.min(Math.max(navClearance, top), winH - cardH - bottomClearance);

      return { left: left, top: top, rot: (Math.random() * 6 - 3).toFixed(1) };
    }

    function createWindow(data, index, total) {
      var win = document.createElement('div');
      win.className = 'cw-window' + (data.focus ? ' cw-focus' : '');
      win.style.width = (data.focus ? getFocusSize() : getCardSize()) + 'px';

      var pos = data.focus ? centerPosition(getFocusSize()) : randomScatter(index, total);
      win.style.left = pos.left + 'px';
      win.style.top = pos.top + 'px';
      win.style.setProperty('--rot', pos.rot + 'deg');
      win.style.zIndex = data.focus ? (++zCounter + 50) : ++zCounter;

      win.innerHTML =
        '<div class="cw-titlebar" style="background:' + data.titleBg + '; color:' + data.titleText + ';">' +
          '<div class="cw-dots">' +
            '<button class="cw-dot cw-dot-close" title="close"></button>' +
            '<button class="cw-dot cw-dot-min" title="minimize"></button>' +
          '</div>' +
          '<div class="cw-titleicon">' + data.icon + '</div>' +
          '<div class="cw-title">' + data.title + '</div>' +
        '</div>' +
        '<div class="cw-body">' +
          '<div class="cw-bigicon">' + data.bigicon + '</div>' +
          '<div class="cw-hook">' + data.hook + '</div>' +
          '<div class="cw-sub">' + data.sub + '</div>' +
          '<div class="cw-actions">' +
            '<button class="btn btn-copy cw-copy">copy</button>' +
            '<a class="btn btn-open" style="background:' + data.titleBg + '; color:' + data.titleText + ';" href="' + data.href + '" target="_blank" rel="noopener">claim &#8599;</a>' +
          '</div>' +
        '</div>';

      layer.appendChild(win);
      requestAnimationFrame(function () { win.classList.add('open'); });
      openWindows.push(win);

      var titlebar = win.querySelector('.cw-titlebar');
      var offsetX = 0, offsetY = 0, dragging = false;

      titlebar.addEventListener('mousedown', function (e) {
        if (e.target.classList.contains('cw-dot')) return;
        dragging = true;
        var rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        win.style.zIndex = ++zCounter;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
      });
      function onDrag(e) {
        if (!dragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
      }
      function stopDrag() {
        dragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
      }

      titlebar.addEventListener('touchstart', function (e) {
        if (e.target.classList.contains('cw-dot')) return;
        var t = e.touches[0];
        var rect = win.getBoundingClientRect();
        offsetX = t.clientX - rect.left;
        offsetY = t.clientY - rect.top;
        win.style.zIndex = ++zCounter;
      }, { passive: true });
      titlebar.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        win.style.left = (t.clientX - offsetX) + 'px';
        win.style.top = (t.clientY - offsetY) + 'px';
      }, { passive: true });

      function removeWindow() {
        win.classList.add('closing');
        win.classList.remove('open');
        setTimeout(function () {
          win.remove();
          openWindows = openWindows.filter(function (w) { return w !== win; });
          checkAllClosed();
        }, 220);
      }

      win.querySelector('.cw-dot-close').addEventListener('click', removeWindow);
      win.querySelector('.cw-dot-min').addEventListener('click', function () {
        win.classList.toggle('minimized');
      });

      win.addEventListener('mousedown', function () { win.style.zIndex = ++zCounter; });

      win.querySelector('.cw-copy').addEventListener('click', function (e) {
        navigator.clipboard.writeText(data.value).then(function () {
          e.target.textContent = 'copied ✓';
          setTimeout(function () { e.target.textContent = 'copy'; }, 1400);
        });
      });
    }

    function checkAllClosed() {
      if (openWindows.length === 0) hideStopButton();
    }

    function showStopButton() {
      stopBtn.classList.remove('hide-out');
      stopBtn.classList.add('show');
    }
    function hideStopButton() {
      stopBtn.classList.add('hide-out');
      setTimeout(function () {
        stopBtn.classList.remove('show');
        stopBtn.classList.remove('hide-out');
      }, 200);
    }

    function openAll() {
      if (openWindows.length > 0) return;
      var nonFocus = CHANNELS.filter(function (c) { return !c.focus; });
      var focus = CHANNELS.filter(function (c) { return c.focus; });

      nonFocus.forEach(function (ch, i) {
        setTimeout(function () { createWindow(ch, i, nonFocus.length); }, i * 80);
      });

      var focusDelay = nonFocus.length * 80 + 220;
      focus.forEach(function (ch) {
        setTimeout(function () { createWindow(ch, 0, 1); }, focusDelay);
      });

      setTimeout(showStopButton, focusDelay + 200);
    }

    function closeAll() {
      openWindows.slice().forEach(function (win) {
        win.classList.add('closing');
        win.classList.remove('open');
      });
      setTimeout(function () {
        openWindows.forEach(function (win) { win.remove(); });
        openWindows = [];
      }, 220);
      hideStopButton();
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openAll();
    });

    stopBtn.addEventListener('click', closeAll);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (openWindows.length === 0) return;
        var nonFocusWindows = openWindows.filter(function (w) { return !w.classList.contains('cw-focus'); });
        var focusWindows = openWindows.filter(function (w) { return w.classList.contains('cw-focus'); });

        nonFocusWindows.forEach(function (win, i) {
          win.style.width = getCardSize() + 'px';
          var pos = randomScatter(i, nonFocusWindows.length);
          win.style.left = pos.left + 'px';
          win.style.top = pos.top + 'px';
        });

        focusWindows.forEach(function (win) {
          win.style.width = getFocusSize() + 'px';
          var pos = centerPosition(getFocusSize());
          win.style.left = pos.left + 'px';
          win.style.top = pos.top + 'px';
        });
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

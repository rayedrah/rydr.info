// ~/rayed site scripts
// boot intro, mobile nav, and the interactive terminal on the home page

(function () {
  'use strict';

  function initNameIntro() {
    var typedEl = document.getElementById('introTyped');
    var nameEl = document.getElementById('introName');
    if (!typedEl || !nameEl) return;

    var alreadySeen = sessionStorage.getItem('rydr-intro-seen');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || reduced) {
      typedEl.textContent = 'whoami';
      nameEl.textContent = 'RAYED RAHMAN';
      nameEl.classList.add('show');
      sessionStorage.setItem('rydr-intro-seen', '1');
      return;
    }

    sessionStorage.setItem('rydr-intro-seen', '1');

    var cmd = 'whoami';
    var i = 0;

    function typeChar() {
      if (i < cmd.length) {
        typedEl.textContent += cmd.charAt(i);
        i++;
        setTimeout(typeChar, 95);
      } else {
        setTimeout(function () {
          nameEl.textContent = 'RAYED RAHMAN';
          nameEl.classList.add('show');
        }, 350);
      }
    }

    setTimeout(typeChar, 450);
  }

  function initNavToggle() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initTerminal() {
    var form = document.getElementById('termForm');
    if (!form) return;

    var input = document.getElementById('termInput');
    var output = document.getElementById('termOutput');

    var PAGES = {
      home: 'index.html',
      about: 'about.html',
      experience: 'experience.html',
      projects: 'projects.html',
      contact: 'contact.html'
    };

    function print(line) {
      var div = document.createElement('div');
      div.className = 'out';
      div.textContent = line;
      output.appendChild(div);
    }

    function printEcho(cmd) {
      var div = document.createElement('div');
      var promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = '~/rayed $ ';
      div.appendChild(promptSpan);
      div.appendChild(document.createTextNode(cmd));
      output.appendChild(div);
    }

    var COMMANDS = {
      help: function () {
        print('available commands:');
        print('  whoami           who you are talking to');
        print('  status           what i am up to right now');
        print('  skills           top skills and tools');
        print('  cd <page>        go to home, about, experience, projects, contact');
        print('  ls               list pages');
        print('  resume           open resume.pdf');
        print('  contact          how to reach me');
        print('  clear            clear the screen');
      },
      whoami: function () {
        print('rayed rahman, cybersecurity @ purdue honors college');
      },
      status: function () {
        print('currently:');
        print('  intern, cybersecurity @ ags quality action');
        print('  research assistant @ grail lab (pdid)');
        print('  student scholar @ tech justice lab');
        print('  active member, b01lers ctf');
      },
      skills: function () {
        print('penetration testing, vulnerability assessment, ctf, python, java, linux, wireshark, selenium, git, bash');
      },
      ls: function () {
        print('home  about  experience  projects  contact  resume.pdf');
      },
      resume: function () {
        print('opening resume.pdf ...');
        window.open('resume.pdf', '_blank');
      },
      contact: function () {
        print('email: rahrayed@gmail.com');
        print('github: github.com/rayedrah');
        print('linkedin: linkedin.com/in/rayedrah');
      },
      clear: function () {
        output.innerHTML = '';
      }
    };

    function runCd(arg) {
      var key = (arg || '').toLowerCase().replace(/^\/+|\/+$/g, '');
      if (!key) {
        print('usage: cd <home|about|experience|projects|contact>');
        return;
      }
      if (PAGES[key]) {
        print('opening ' + key + ' ...');
        setTimeout(function () {
          window.location.href = PAGES[key];
        }, 250);
      } else {
        print('no such page: ' + key);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = input.value.trim();
      input.value = '';
      if (!raw) return;

      printEcho(raw);

      var parts = raw.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var rest = parts.slice(1).join(' ');

      if (cmd === 'sudo') {
        print('permission denied. you are not root. nice try.');
      } else if (cmd === 'cd') {
        runCd(rest);
      } else if (COMMANDS[cmd]) {
        COMMANDS[cmd]();
      } else {
        print('command not found: ' + cmd + '. type "help" for a list of commands.');
      }

      output.scrollTop = output.scrollHeight;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNameIntro();
    initNavToggle();
    initTerminal();
  });
})();

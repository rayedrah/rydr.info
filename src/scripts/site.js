// ~/rayed site scripts: grain background, square cursor, heading scramble,
// mobile nav, and the little terminal on the home page.

import { initGrain } from './grain.js';
import { initCursor } from './cursor.js';
import { initScramble } from './scramble.js';
import { initAsciiArt } from './ascii-art.js';
import { initIntro } from './intro.js';
import './contact-popup.js';   // self-starting: binds to the nav's contact link

function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'close' : 'menu';
  });
}

function initTerminal() {
  const form = document.getElementById('termForm');
  if (!form) return;
  const input = document.getElementById('termInput');
  const log = document.getElementById('termLog');

  const PAGES = {
    home: 'index.html',
    about: 'about.html',
    experience: 'experience.html',
    projects: 'projects.html',
    contact: 'contact.html',
    blog: 'blog/',
  };

  const print = (text) => {
    const div = document.createElement('div');
    div.className = 'out';
    div.textContent = text;
    log.appendChild(div);
  };
  const echo = (cmd) => {
    const div = document.createElement('div');
    const p = document.createElement('span');
    p.className = 'prompt';
    p.textContent = '~/rayed $ ';
    div.append(p, document.createTextNode(cmd));
    log.appendChild(div);
  };
  const go = (href, msg) => { print(msg); setTimeout(() => { window.location.href = href; }, 300); };

  const COMMANDS = {
    help() {
      print('whoami     who you are talking to');
      print('status     what i am up to right now');
      print('skills     top skills and tools');
      print('ls         list pages');
      print('cd <page>  go to a page');
      print('blog       open brain log');
      print('resume     open resume.pdf');
      print('contact    how to reach me');
      print('clear      clear the screen');
    },
    whoami() { print('rayed rahman, cybersecurity @ purdue honors college'); },
    status() {
      print('intern, cybersecurity @ ags quality action');
      print('research assistant @ grail lab (pdid)');
      print('student scholar @ tech justice lab');
      print('active member, b01lers ctf');
    },
    skills() { print('pentesting, vuln assessment, ctf, python, java, linux, wireshark, selenium, git, bash'); },
    ls() { print('home  about  experience  projects  blog/  contact  resume.pdf'); },
    resume() { print('opening resume.pdf ...'); window.open('resume.pdf', '_blank'); },
    contact() {
      print('email     contact@rydr.info');
      print('github    github.com/rayedrah');
      print('linkedin  linkedin.com/in/rayedrah');
    },
    blog() { go(PAGES.blog, 'tail -f ~/brain.log ...'); },
    clear() { log.innerHTML = ''; },
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    echo(raw);
    const [cmdRaw, ...rest] = raw.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(' ');

    if (cmd === 'sudo') print('permission denied. you are not root. nice try.');
    else if (cmd === 'cd') {
      const key = arg.toLowerCase().replace(/^\/+|\/+$/g, '');
      if (!key) print('usage: cd <home|about|experience|projects|blog|contact>');
      else if (PAGES[key]) go(PAGES[key], `opening ${key} ...`);
      else print(`no such page: ${key}`);
    } else if (cmd === 'cat' && /brain\.?log/i.test(arg)) COMMANDS.blog();
    else if (COMMANDS[cmd]) COMMANDS[cmd]();
    else print(`command not found: ${cmd}. type "help"`);

    log.scrollTop = log.scrollHeight;
  });
}

function boot() {
  initGrain();
  initCursor();
  initScramble();
  initAsciiArt();
  initIntro();
  initNav();
  initTerminal();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

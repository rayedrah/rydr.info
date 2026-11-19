// All site content in one place. Pages render from these lists.

export const LINKS = {
  email: 'contact@rydr.info',
  github: 'https://github.com/rayedrah',
  linkedin: 'https://linkedin.com/in/rayedrah',
  instagram: 'https://instagram.com/rayed_rn',
  resume: 'resume.pdf?v=2026-11-19',   // change the ?v= date whenever public/resume.pdf is replaced, so browsers fetch the new one
};

/* Projects. To add one, copy an object and change the values.
   scores: rate 1-10 on each axis of the skill map
     systems  = infrastructure / engineering depth
     security = how security-focused the work is
     research = how exploratory / research-driven
     scale    = size of impact, users, or scope
     polish   = how finished / production-ready
   desc may contain links (HTML). */
export const AXES = ['systems', 'security', 'research', 'scale', 'polish'];

export const PROJECTS = [
  {
    id: 'deadray', title: 'DeadRAY Network', sub: 'Self-built internal network and service stack',
    scores: { systems: 9, security: 8, research: 4, scale: 4, polish: 7 },
    desc: 'My test lab: an Ubuntu server, a Raspberry Pi gateway (Wi-Fi AP, DHCP, NAT) and an Arch workstation joined over a Tailscale (WireGuard) mesh. Pi-hole runs internal DNS for 10+ hostnames behind a Caddy TLS reverse proxy, with blocklists that stop DNS-over-HTTPS bypass. 10+ containers (Vaultwarden, Immich, Syncthing, Samba, Jellyfin, a local LLM agent) sit behind default-deny ufw and fail2ban, with Glances agents feeding a live dashboard. Attacking it myself, I found Docker publishing ports past the firewall and a fail2ban jail blind to Ubuntu 24.04 SSH logs; every service is now bound to the VPN, with zero open inbound ports. I also traced a 7.5-hour outage through sar and wpa_supplicant logs to a failed Wi-Fi supplicant and shipped a systemd watchdog for it.',
    stack: ['Ubuntu Server', 'Pi-hole', 'Caddy', 'Tailscale', 'Docker'],
  },
  {
    id: 'corpctf', title: 'Agile Cyber Drill CTF', sub: '50-challenge CTFd platform for a national drill',
    scores: { systems: 7, security: 8, research: 2, scale: 8, polish: 8 },
    desc: 'Built, shipped and ran in production the CTF platform for the national 2nd Agile Cyber Drill 2026 at AGS Quality Action: 50 challenges on CTFd with a Flask backend, served through a Cloudflare Tunnel. Wrote the solution guides across web, crypto, forensics, reversing and OSINT, and fixed live issues mid-event, including a password double-hashing bug in CTFd\'s data model, flag format errors and admin account recovery.',
    stack: ['CTFd', 'Flask', 'Cloudflare Tunnel'],
  },
  {
    id: 'trkt', title: 'TRKT.', sub: 'QR event ticketing & live check-in',
    scores: { systems: 8, security: 6, research: 3, scale: 5, polish: 7 },
    desc: 'Serverless QR ticketing on Cloudflare Workers + KV, used at real events. Upload a CSV guest list, get per-guest QR tickets, and check people in from any phone with undo, event-scoped passwords and check-in logs. It sits dormant between events, so there is little to attack when it is not in use. Live at <a href="https://trkt.rydr.info" target="_blank" rel="noopener">trkt.rydr.info</a>.',
    stack: ['Cloudflare Workers', 'KV', 'JavaScript'],
  },
  {
    id: 'ping', title: 'PING & DeadRAY Hub', sub: 'Public app and a thermal receipt printer',
    scores: { systems: 6, security: 5, research: 2, scale: 3, polish: 6 },
    desc: 'PING is a public web app that prints visitors\' messages on a thermal receipt printer on my desk, served through a Cloudflare Tunnel with per-IP rate limiting (<a href="https://ping.rydr.info" target="_blank" rel="noopener">ping.rydr.info</a>). The printer also runs off a Flask hub that pulls my Outlook calendar and Brightspace deadlines and syncs a to-do list across devices, as a systemd user service. I fixed its USB, device-permission and Bengali-encoding problems myself.',
    stack: ['Python', 'Flask', 'systemd'],
  },
  {
    id: 'pdid', title: 'PDID Pipeline', sub: 'Deepfake detection research, GRAIL Lab',
    scores: { systems: 5, security: 4, research: 9, scale: 6, polish: 5 },
    desc: 'Collection pipelines for the Political Deepfakes Incident Database, built with Selenium, undetected-chromedriver and yt-dlp to work around platform bot detection and catalog media into structured datasets. I also evaluated candidate detection models for the benchmark (ResNeXt was picked), automated annotation, and built the research website.',
    stack: ['Python', 'Selenium', 'yt-dlp'],
  },
  {
    id: 'inbox', title: 'PurdueSorter', sub: 'Outlook add-in, Microsoft Graph API',
    scores: { systems: 5, security: 2, research: 1, scale: 4, polish: 6 },
    desc: 'Outlook add-in that sorts academic mail by who sent it (TA or professor, looked up in the Purdue Directory) through Microsoft Graph, with one-click folders and undo.',
    stack: ['Graph API', 'JavaScript', 'Outlook'],
  },
];

export const EXPERIENCE = [
  {
    group: 'Now',
    items: [
      {
        role: 'Independent Security Researcher', org: 'Offensive & AI security roadmap', date: '2026 – now', open: true,
        text: 'Working through my own roadmap from fundamentals to web exploitation, bug bounty and AI red teaming, testing only authorized scope and my own lab. Write-ups go on Brain Log.',
        points: [
          'Pen-tested my own internet-facing network: found Docker publishing container ports past the host firewall and a fail2ban jail missing Ubuntu 24.04 SSH logs, then moved every service behind the VPN.',
        ],
      },
      {
        role: 'Blue Team Member', org: 'BlueTeam@Purdue', place: 'West Lafayette, Indiana', date: 'Fall 2026 – now',
        text: 'Going to the club\'s meetings and preparing for CCDC, the Collegiate Cyber Defense Competition.',
        points: [
          'BoilerStorm 2026 (CCDC-style): defended a mock company network, an OPNsense firewall and four servers, against a live red team for a full day. Hardened the firewall and Windows hosts, kept scored services up, and wrote inject memos for the company\'s IT director.',
          'Built our team\'s defensive toolkit beforehand: read-only scripts that hunt for persistence and webshells and snapshot users, ports, services and scheduled tasks on Windows and Linux.',
          'CCDC prep: older services (Apache, BIND, Sendmail), perimeter defense, and user management across Unix and Windows.',
        ],
      },
      {
        role: 'CTF Player', org: 'b01lers, Purdue', place: 'West Lafayette, Indiana', date: '2025 – now',
        points: [
          'Competing in MITRE eCTF 2027 (embedded systems security).',
          'Solved bash CGI injection, AES crypto and GBA ROM reversing challenges, plus 50+ more across HackTheBox, TryHackMe, OverTheWire and picoCTF.',
          'Also played IronCyber Global Student CTF and the SkyRift drone hacking CTF.',
        ],
      },
      {
        role: 'Student Affiliate Scholar', org: 'Tech Justice Lab, Honors College', date: 'Jan 2026 – now',
        text: 'Research on the social and ethical impact of technology: how systems spread risk, harm and benefit.',
      },
      {
        role: 'Technical Head', org: 'Purdue Bangladesh Student Association', date: '2026 – now',
        text: 'Weekly progress checks with the administration, operations and PR leads; inventory and purchase records.',
      },
      {
        role: 'Web Master & Freelance Developer', org: 'Client websites', date: 'Jun 2025 – now',
        text: 'WordPress sites for clients, including jewelry shops and andolokotha.info, a protest incident tracker.',
      },
    ],
  },
  {
    group: 'Work',
    items: [
      {
        role: 'Cybersecurity Intern', org: 'AGS Quality Action', place: 'Dhaka, Bangladesh', date: 'Jun – Aug 2026',
        text: "ISO/IEC 17025 accredited Software Testing Lab, supporting the national 2nd Agile Cyber Drill 2026.",
        points: [
          'Built and ran the drill\'s 50-challenge CTF platform (CTFd, Flask, Cloudflare Tunnel), and fixed live bugs during the event.',
          'Wrote vulnerability assessment and penetration testing (VAPT) test plans and reporting templates; automated PDF report generation in Python.',
          'Wrote solution guides across web, crypto, forensics, reversing and OSINT, and helped design the scoring and ranking.',
          'Built the outreach dataset covering 479 organizations across 21 sectors.',
        ],
      },
      {
        role: 'Research Assistant, Tech Team', org: 'GRAIL Lab', place: 'West Lafayette, Indiana', date: 'Jan – Aug 2026',
        points: [
          'Political Deepfakes Incident Database (PDID): a benchmark of deepfake detectors on real, compressed social media content.',
          'Built Python collection pipelines (Selenium, undetected-chromedriver, yt-dlp) that work around platform bot detection.',
          'Evaluated detection models, automated annotation, and built the research website.',
        ],
      },
      {
        role: 'Cofounder', org: 'SYNQ.', date: 'Jun 2025 – Jun 2026',
        text: 'Sportswear brand designed in pixels, worn in life. @synq.ware on Instagram.',
      },
      {
        role: 'Student Office Staff', org: 'Purdue Housing', place: 'West Lafayette, Indiana', date: 'Jan – May 2026',
        points: [
          'Residence hall front desk: identity checks, access control, and confidential student records.',
          'Documented incidents and escalated them through structured reporting.',
        ],
      },
      {
        role: 'Dining Hall Student Associate', org: 'Purdue Dining & Culinary', place: 'West Lafayette, Indiana', date: 'Sep 2025 – Jan 2026',
        text: 'Kept service running through teamwork and attention to detail.',
      },
    ],
  },
  {
    group: 'Chittagong',
    items: [
      {
        role: 'President & Founder', org: 'CGSEncrypted', place: 'Chittagong, Bangladesh', date: 'May 2024 – Jul 2025',
        points: [
          'Founded the first high school cybersecurity club and CTF team in Bangladesh.',
          'Wrote the training roadmap, ran in-school CTFs, and taught 40+ members.',
        ],
      },
      {
        role: 'Vice President', org: 'CGS Programming Club', date: 'Jun 2023 – Jul 2025',
        points: [
          'Gold at the 2024 CGS Programming Contest, bronze in 2023. Trained 50+ students for contests.',
        ],
      },
      {
        role: 'Technical Director', org: 'All Stars League, Chattogram', date: 'May 2023 – 2025',
        text: "Ran the tech for Chattogram's first multi-team league: 12 teams over 12 weeks, 5M+ views and a 70K BDT prize pool.",
      },
      {
        role: "Duke of Edinburgh's Award", org: 'Gold Awardee', date: 'Gold',
        text: 'Led a team of 20+ in community service: fish farming, organic fertilizer production and land ploughing.',
      },
    ],
  },
];

export const EDUCATION = [
  { name: 'Purdue University', meta: 'class of 2029', tags: ['B.S. Cybersecurity', 'CS minor', 'Honors'] },
  { name: 'Chittagong Grammar School, A Levels', meta: '2023 – 2025', tags: ['4 A Levels', 'top 5%'] },
  { name: 'Chittagong Grammar School, N.C.', meta: '2010 – 2023', tags: ['GPA 5', 'A+ in 13 subjects'] },
];

export const CERTS = [
  { name: 'CompTIA Security+', tags: ['in progress'] },
  { name: 'Google Cybersecurity Certificate', tags: ['in progress'] },
  { name: 'Web Application Security Training, CEH curriculum', tags: ['Eshikhon'] },
  { name: 'World Wide Web, Pre Security Learning Path', tags: ['TryHackMe'] },
  { name: "Purdue Polytechnic Dean's List", tags: ['Fall 2025'] },
];

export const SKILLS = {
  focus: ['penetration testing', 'vulnerability assessment', 'blue team', 'network defense', 'ctf', 'ai security'],
  languages: ['python', 'bash', 'java', 'javascript', 'sql'],
  tools: ['linux', 'nmap', 'wireshark', 'burp suite', 'docker', 'caddy', 'pi-hole', 'tailscale', 'ufw / fail2ban', 'git'],
};

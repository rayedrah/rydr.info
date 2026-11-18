// All site content in one place. Pages render from these lists.

export const LINKS = {
  email: 'contact@rydr.info',
  github: 'https://github.com/rayedrah',
  linkedin: 'https://linkedin.com/in/rayedrah',
  instagram: 'https://instagram.com/rayed_rn',
  resume: 'resume.pdf',
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
    id: 'trkt', title: 'TRKT.', sub: 'QR event ticketing & live check-in',
    scores: { systems: 8, security: 6, research: 3, scale: 5, polish: 7 },
    desc: 'QR ticketing and live check-in on Cloudflare Workers + KV. Upload a CSV, get per-guest QR tickets, check people in from any phone. Live at <a href="https://trkt.rydr.info" target="_blank" rel="noopener">trkt.rydr.info</a>.',
    stack: ['Cloudflare Workers', 'KV', 'JavaScript'],
  },
  {
    id: 'corpctf', title: 'Corporate CTF Build', sub: 'Large scale CTFd deployment for AGS QA',
    scores: { systems: 7, security: 8, research: 2, scale: 8, polish: 7 },
    desc: '50-challenge CTFd platform for a corporate cyber drill: reversing, web, OSINT, and trivia, served by a custom Flask backend behind a Cloudflare Tunnel.',
    stack: ['CTFd', 'Flask', 'Docker'],
  },
  {
    id: 'deadray', title: 'DeadRay Network', sub: 'Raspberry Pi home server infrastructure',
    scores: { systems: 9, security: 7, research: 2, scale: 3, polish: 6 },
    desc: 'Self-hosted Raspberry Pi server: network-wide ad blocking, private mesh VPN, and file sync. No third party cloud.',
    stack: ['Raspberry Pi', 'Pi-hole', 'Tailscale', 'Linux'],
  },
  {
    id: 'pdid', title: 'PDID Pipeline', sub: 'Deepfake detection research, GRAIL Lab',
    scores: { systems: 4, security: 3, research: 9, scale: 6, polish: 5 },
    desc: 'Selenium scraping across social platforms feeds a ResNext deepfake classifier, synced to Airtable for review.',
    stack: ['Python', 'Selenium', 'ResNext'],
  },
  {
    id: 'inbox', title: 'Inbox Sorter', sub: 'Outlook add-in, Microsoft Graph API',
    scores: { systems: 5, security: 2, research: 1, scale: 4, polish: 7 },
    desc: 'Outlook add-in that sorts incoming mail with Microsoft Graph and Purdue Directory lookups.',
    stack: ['Graph API', 'JavaScript', 'Outlook'],
  },
  {
    id: 'boilers', title: 'b01lers CTF', sub: "Purdue's competitive cybersecurity team",
    scores: { systems: 5, security: 9, research: 3, scale: 2, polish: 3 },
    desc: "Competing in national CTFs across pwn, web, and crypto with Purdue's team.",
    stack: ['pwn', 'web', 'crypto', 'rev'],
  },
];

export const EXPERIENCE = [
  {
    group: 'Now',
    items: [
      {
        role: 'Cybersecurity Intern', org: 'AGS Quality Action', place: 'Dhaka, Bangladesh', date: 'Jun 2026 – now', open: true,
        text: "Intern at AGS QA's ISO/IEC 17025 accredited Software Testing Lab, supporting the national 2nd Agile Cyber Drill 2026.",
        points: [
          'Helped design and validate CTF challenges, scenarios, and scoring.',
          'Helped plan vulnerability assessments and penetration testing methodologies.',
          'Prepared evaluation materials, reporting templates, and post event reports.',
        ],
      },
      {
        role: 'Research Assistant, Tech Team', org: 'GRAIL Lab', place: 'West Lafayette, Indiana', date: 'Jan 2026 – now', open: true,
        points: [
          'Political Deepfakes Incident Database (PDID): benchmarking detectors on real, compressed social media content.',
          'Analyzing deepfakes from X, YouTube, TikTok, and Instagram.',
          'Automating dataset management and annotation for the research site.',
        ],
      },
      {
        role: 'Student Scholar', org: 'Tech Justice Lab', date: 'Jan 2026 – now',
        points: [
          'Research on the social and ethical impact of technology and how systems distribute risk and harm.',
        ],
      },
      {
        role: 'Cofounder', org: 'SYNQ.', date: 'Jun 2025 – now',
        text: 'Sportswear brand designed in pixels, worn in life. @synq.ware on Instagram.',
      },
    ],
  },
  {
    group: 'Purdue',
    items: [
      {
        role: 'Student Office Staff', org: 'Purdue Housing', place: 'West Lafayette, Indiana', date: 'Jan – May 2026',
        points: [
          'Front desk for residents and staff: inquiries, check in/out, rentals, and confidential records.',
          'Handled time sensitive and emergency situations with proper escalation.',
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
        role: 'President & Founder', org: 'CGSEncrypted', place: 'Chittagong, Bangladesh', date: 'Sep 2024 – Jul 2025',
        points: [
          'Founded the first high school cybersecurity club and CTF team in Bangladesh.',
          'Taught 40+ members and ran in school CTFs.',
        ],
      },
      {
        role: 'Head of Academics', org: 'CGS MUN Club', date: 'Aug 2024 – Jul 2025',
        points: [
          'Led 10+ members writing guides for 220+ delegates. Verbal Mention at PIMUN 2023.',
        ],
      },
      {
        role: 'Vice President', org: 'CGS Programming Club', date: 'Jun 2024 – Jul 2025',
        points: [
          'Gold at the 2024 CGS Programming Contest, bronze in 2023. Trained 50+ students.',
        ],
      },
    ],
  },
  {
    group: 'Earlier',
    items: [
      {
        role: 'Business Owner', org: 'EstiloxSportswear', date: 'Sep 2024 – Jul 2025',
        points: [
          'Streetwear brand: 1,500+ jersey sets, 5+ sponsored events, 15K+ followers.',
        ],
      },
      {
        role: 'Main Director', org: 'Club De Videographie', date: 'Jul 2024 – Jul 2025',
        points: [
          'Led 14 videographers and editors; grew the club past 1,200 followers.',
        ],
      },
      {
        role: 'Photographer', org: 'Special Smiles', date: 'Oct 2023 – May 2025',
        text: 'Community service: technical support and event management.',
      },
      {
        role: 'Technical Director', org: 'All Stars League, Chattogram', date: 'May 2023 – 2025',
        text: "Technical operations for one of Chattogram's major tournaments.",
      },
    ],
  },
];

export const EDUCATION = [
  { name: 'Purdue University', meta: 'class of 2029', tags: ['B.S. Cybersecurity', 'CS minor', 'Honors', '3.94 GPA'] },
  { name: 'Chittagong Grammar School, A Levels', meta: '2023 – 2025', tags: ['4 A Levels', 'top 5%'] },
  { name: 'Chittagong Grammar School, N.C.', meta: '2010 – 2023', tags: ['national curriculum'] },
];

export const CERTS = [
  { name: 'World Wide Web, Pre Security Learning Path', tags: ['certificate'] },
  { name: 'Networking Nerd', tags: ['recognition'] },
  { name: "Purdue Polytechnic Dean's List", tags: ['Fall 2025'] },
];

export const SKILLS = {
  focus: ['penetration testing', 'vulnerability assessment', 'ctf', 'offensive security', 'threat hunting'],
  languages: ['python', 'java', 'bash'],
  tools: ['linux', 'wireshark', 'selenium', 'tailscale', 'git', 'hyprland'],
};

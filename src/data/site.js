/**
 * Site-wide identity and contact details.
 * Everything textual that a recruiter reads lives here or in caseStudies.js,
 * so the copy can be edited without touching layout code.
 */

export const site = {
  // --- identity -------------------------------------------------------
  name: 'Corran Chatfield',
  handle: 'cosacee',
  role: 'Infrastructure & Operations Specialist',
  // One sentence. This is the single most-read line on the site.
  headline: 'I build and operate self-hosted infrastructure — virtualisation, containers, network edge, and the automation that keeps it running.',

  // --- availability ---------------------------------------------------
  location: 'Cramlington, United Kingdom',
  status: 'Open to infrastructure / platform / SRE roles',

  // --- links ----------------------------------------------------------
  email: 'corran.chatfield@outlook.com',
  github: 'https://github.com/cosacee',
  linkedin: 'https://www.linkedin.com/in/corranchatfield',
  cv: '/cv.pdf', // drop the PDF in public/ to activate


  // --- summary stats shown in the hero --------------------------------
  stats: [
    { label: 'services operated', value: '28' },
    { label: 'uptime monitored', value: '24/7' },
  ],
};

export const nav = [
  { href: '/#work', label: 'Work' },
  { href: '/#homelab', label: 'Homelab' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#contact', label: 'Contact' },
];

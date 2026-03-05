// Site configuration — placeholder values until owner provides real content.
// All copy requires explicit owner approval before it is considered final.

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactConfig {
  email: string;
  linkedin: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  siteUrl: string;
  description: string;
  nav: NavLink[];
  contact: ContactConfig;
}

export const siteConfig: SiteConfig = {
  name: 'Adam Angerami',
  tagline: 'Business Operations Leader.',
  siteUrl: 'https://aangerami.com',
  description: 'PLACEHOLDER — owner to provide a 1–2 sentence site description.',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
  ],
  contact: {
    email: 'adam.angerami@gmail.com',
    linkedin: 'https://www.linkedin.com/in/adam-angerami/',
  },
};

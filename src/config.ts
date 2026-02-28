// Site configuration — placeholder values until owner provides real content.
// All copy requires explicit owner approval before it is considered final.

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactConfig {
  email: string;
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
  name: 'Your Name',
  tagline: 'Business strategy and operations.',
  siteUrl: 'https://example.com', // PLACEHOLDER — owner to replace with real domain
  description: 'PLACEHOLDER — owner to provide a 1–2 sentence site description.',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
  ],
  contact: {
    email: 'hello@example.com',
  },
};

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
  nav: NavLink[];
  contact: ContactConfig;
}

export const siteConfig: SiteConfig = {
  name: 'Your Name',
  tagline: 'Business strategy and operations.',
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

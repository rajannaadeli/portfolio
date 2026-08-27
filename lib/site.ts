/*
  Site constants — real links from the master brief §2. No placeholders.
*/

export const SITE = {
  name: "Rajanna Adeli",
  domain: "rajanna.dev",
  url: "https://rajanna.dev",
  email: "hello@rajanna.dev",
  role: "Full-stack developer — workforce & operations software",
  location: "Pune, India · works with AU/US/UK clients",
  positioning:
    "I build workforce and operations software for businesses that run on deskless teams — rostering, GPS time-tracking, compliance, and the field apps that drive them.",
  links: {
    upwork: "https://www.upwork.com/freelancers/~01e368e57669434d77",
    linkedin: "https://www.linkedin.com/in/rajannaadeli/",
    github: "https://github.com/rajannaadeli",
    resume: "/rajanna-adeli-resume.pdf",
    rosterbay: "https://rosterbay.com",
    rosterbayWorker: "https://worker.rosterbay.com",
  },
} as const;

export const NAV_ITEMS = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
] as const;

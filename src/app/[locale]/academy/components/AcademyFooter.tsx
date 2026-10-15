import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/#internships', label: 'Internships' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact us' },
];

const RESOURCE_LINKS = [
  { href: '/courses', label: 'Course catalogue' },
  { href: '/certificates/verify', label: 'Verify a certificate' },
  { href: '/dashboard', label: 'Student dashboard' },
  { href: '/auth/signup', label: 'Create an account' },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: '#',
    path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z',
  },
];

export default function AcademyFooter() {
  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ background: '#0B1F3F' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(217, 178, 84, 0.55), transparent)',
        }}
      />

      {/* Verify strip */}
      {/* <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(217,178,84,0.35)] bg-[rgba(217,178,84,0.14)] text-[#E5C66E]">
              <ShieldCheck size={15} />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-white">
                Checking a credential?
              </p>
              <p className="mt-0.5 text-[12.5px] text-white/60">
                Every certificate we issue carries an ID you can verify publicly.
              </p>
            </div>
          </div>
          <Link href="/certificates/verify" className="w-full shrink-0 sm:w-auto">
            <button
              type="button"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:border-[rgba(217,178,84,0.5)] hover:bg-[rgba(217,178,84,0.12)] sm:w-auto"
            >
              Verify a certificate
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </Link>
        </div>
      </div> */}

      {/* Main grid */}
      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/logo-gold.png"
                alt=""
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="flex flex-col leading-none">
                <span
                  className="text-[15px] uppercase tracking-[0.09em] text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                >
                  Sajjad Husain
                </span>
                <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#E5C66E]">
                  Legal Academy
                </span>
              </span>
            </div>

            <p className="mb-6 max-w-sm text-[13.5px] leading-relaxed text-white/65">
              Empowering future legal professionals with practical education,
              courtroom exposure and ethical grounding.
            </p>

            <div className="flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition-colors hover:border-[#E5C66E] hover:bg-[#C9A227] hover:text-[#1F1703]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d={s.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Academy nav */}
          <nav aria-label="Academy">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E5C66E]">
              Academy
            </h2>
            <ul className="space-y-2.5 text-[13.5px]">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-block text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Student nav */}
          <nav aria-label="Students">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E5C66E]">
              Students
            </h2>
            <ul className="space-y-2.5 text-[13.5px]">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-block text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E5C66E]">
              Contact
            </h2>
            <ul className="space-y-3 text-[13.5px]">
              <li>
                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com"
                  className="flex items-start gap-2.5 text-white/70 transition-colors hover:text-white"
                >
                  <Mail size={15} className="mt-0.5 shrink-0 text-[#E5C66E]" />
                  <span className="break-all">sajjadhusainlawassociates@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+917080909786"
                  className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
                >
                  <Phone size={15} className="shrink-0 text-[#E5C66E]" />
                  +91 70809 09786
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#E5C66E]" />
                <address className="not-italic leading-relaxed">
                  Block-C, High Court, Advocates Chamber 515,
                  <br />
                  Lucknow Ayodhya Rd, Gomti Nagar, Lucknow 226010
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[12.5px] text-white/55 md:flex-row">
          <p>
            © {new Date().getFullYear()} Sajjad Husain Legal Academy. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms &amp; conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

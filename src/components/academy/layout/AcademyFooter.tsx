import React from 'react';
import Link from 'next/link';

export default function AcademyFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-[#0a1628] via-[#122340] to-[#1a2f4d] text-white overflow-hidden mt-auto">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          
          <div className="md:col-span-1 space-y-6">
            <span className="text-xl font-bold tracking-tight text-white block">
              LegalTech <span className="text-[#C9A227]">Academy</span>
            </span>
            <p className="text-blue-100 leading-relaxed text-sm">
              Empowering professionals with world-class legal education and resources.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
              Learn
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/academy/courses" className="text-blue-100 hover:text-white transition-colors">All Courses</Link></li>
              <li><Link href="/academy" className="text-blue-100 hover:text-white transition-colors">Learning Paths</Link></li>
              <li><Link href="/academy" className="text-blue-100 hover:text-white transition-colors">Certifications</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
              Community
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/academy" className="text-blue-100 hover:text-white transition-colors">Discussions</Link></li>
              <li><Link href="/academy" className="text-blue-100 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/academy" className="text-blue-100 hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
              Legal
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="text-blue-100 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-blue-100 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-blue-200">&copy; {new Date().getFullYear()} LegalTech Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
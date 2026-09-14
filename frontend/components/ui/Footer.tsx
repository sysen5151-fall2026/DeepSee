import Link from 'next/link';
import { Activity, Github, LockKeyhole } from 'lucide-react';
import { REPO_URL } from '@/lib/config';

const Footer = () => (
  <footer className="border-t border-[#dbe7e3] bg-white">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <div className="flex items-center gap-3 text-sm text-[#698087]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e2f0ed] text-[#0d766e]"><Activity className="h-4 w-4" /></span>
        <span>
          <strong className="text-[#294951]">DeepSee</strong> · Human-in-the-loop clinical decision support · SYSEN 5151 prototype
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#789096]">
        <span className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" /> PHI stays local</span>
        <Link href="/about" className="hover:text-[#0d766e]">System information</Link>
        <Link href="/contact" className="hover:text-[#0d766e]">Support</Link>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#0d766e]">
          <Github className="h-3.5 w-3.5" /> Source
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;

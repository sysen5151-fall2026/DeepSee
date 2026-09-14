'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { ChevronDown, FlaskConical, LockKeyhole, LogOut, Menu, Plus, X } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { isDemoMode } from '@/lib/config';

const navLinks = [
  { name: 'Overview', href: '/' },
  { name: 'New review', href: '/analyze', protected: true },
  { name: 'Recent reviews', href: '/cases', protected: true },
  { name: 'About', href: '/about' },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticatedUser, logout, user } = useAuth();
  const demo = isDemoMode();

  const displayName = user?.name || user?.username || 'Clinician';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const visibleLinks = navLinks.filter((link) => !link.protected || isAuthenticatedUser);

  return (
    <header className="sticky top-0 z-50 border-b border-[#dbe7e3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="DeepSee home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/deepsee-mark.svg" alt="" className="h-9 w-9 rounded-xl shadow-sm" />
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-[-0.02em] text-[#12333a]">DeepSee</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.17em] text-[#789096]">Clinical AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {visibleLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={classNames(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  pathname === link.href ? 'bg-[#edf6f4] text-[#0d766e]' : 'text-[#60777d] hover:bg-[#f4f8f7] hover:text-[#17383f]'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {demo ? (
            <span className="flex items-center gap-2 rounded-full border border-[#efd0ad] bg-[#fff8ee] px-3 py-1.5 text-xs font-semibold text-[#80501a]" title="No backend connected. A mock model runs in the browser.">
              <FlaskConical className="h-3.5 w-3.5 text-[#b36a19]" />
              Demo mode · mock model
            </span>
          ) : (
            <span className="flex items-center gap-2 rounded-full border border-[#d6e5e1] bg-[#f7faf9] px-3 py-1.5 text-xs font-semibold text-[#48666d]">
              <LockKeyhole className="h-3.5 w-3.5 text-[#0d766e]" />
              Local processing
              <span className="h-1.5 w-1.5 rounded-full bg-[#2aa876]" />
            </span>
          )}

          {isAuthenticatedUser ? (
            <>
              {pathname !== '/analyze' && (
                <Link href="/analyze" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d766e] px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#075e58]">
                  <Plus className="h-4 w-4" />
                  New review
                </Link>
              )}
              <div className="group relative">
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#f3f7f6]" aria-label="Account menu">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dceeea] text-xs font-extrabold text-[#0b655f]">{initials}</span>
                  <ChevronDown className="h-4 w-4 text-[#7b9095]" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#dbe7e3] bg-white p-1.5 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-extrabold text-[#25474e]">{displayName}</p>
                    <p className="text-[11px] text-[#7f9297]">{demo ? 'Demo session' : 'Clinician session'}</p>
                  </div>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#526e74] hover:bg-[#f3f7f6]">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-[#15383f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2c32]">
              Clinician sign in
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="rounded-lg p-2 text-[#405f66] hover:bg-[#f3f7f6] md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#e4ece9] bg-white px-4 py-3 md:hidden">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold text-[#80501a]">{demo ? 'Demo mode · mock model' : 'Local processing'}</div>
            {visibleLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#45636a] hover:bg-[#f2f7f5]">
                {link.name}
              </Link>
            ))}
            {isAuthenticatedUser ? (
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#45636a] hover:bg-[#f2f7f5]">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-[#0d766e] px-3 py-2.5 text-center text-sm font-bold text-white">
                Clinician sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

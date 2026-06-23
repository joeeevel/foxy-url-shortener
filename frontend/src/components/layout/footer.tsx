'use client';

import { Navbar } from "./navbar";

export function Footer() {
  return (
    <footer className="bg-transparenttext-text-dark p-8 text-center flex items-center justify-center relative">
        <div className="max-w-7xl flex justify-between w-full">
            <img src="./foxy-logo-text.svg" alt="Foxy Logo Text" />
            <div className="absolute left-1/2 -translate-x-1/2"><Navbar noPadding /></div>
            <p className="text-lg text-gray-2 ">
            &copy; {new Date().getFullYear()} Foxy. All rights reserved.
            </p>
        </div>
    </footer>
  );
}
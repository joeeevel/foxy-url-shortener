"use client";
import ArrowUpRightIcon from '@iconify-react/lucide/arrow-up-right';
import Link from "next/link";
export function Navbar({ noPadding }: { noPadding?: boolean }) {


    return (
        <nav >
            <div className={`text-subhead space-x-12 max-w-7xl mx-auto flex justify-center items-center font-sf ${noPadding ? "" : "pt-12"}`}>
                <Link href="#about" className="hover:text-brand-primary transition-colors duration-200">About</Link>
                <Link href="#pricing" className="hover:text-brand-primary transition-colors duration-200">Pricing</Link>
                <Link href="#for-developers" className="hover:text-brand-primary transition-colors duration-200">For Developers</Link>
                <Link href="#signin" className='relative group hover:text-brand-primary transition-colors duration-200'>Sign in <ArrowUpRightIcon className='absolute -right-7 top-1/2 -translate-y-1/2 size-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200'/></Link>
                <Link href="#signin" className='relative group hover:text-brand-primary transition-colors duration-200'>Try it for free! <ArrowUpRightIcon className='absolute -right-7 top-1/2 -translate-y-1/2 size-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200'/></Link>

            </div>
        </nav>
    );
}
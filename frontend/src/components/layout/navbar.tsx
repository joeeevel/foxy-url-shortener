"use client";

import Link from "next/link";
export function Navbar() {


    return (
        <nav >
            <div className=" text-gray-2 space-x-12 max-w-7xl mx-auto flex justify-center items-center pt-12 font-sf">
                <Link href="#about">About</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="#for-developers">For Developers</Link>
                <Link href="#signin">Sign in</Link>

            </div>
        </nav>
    );
}
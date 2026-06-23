'use client';

import Button from "../ui/Button";
import UpRightArrowIcon from '@iconify-react/openmoji/up-right-arrow';

export function CTA () {
    return (
    <section className="bg-brand-primary mt-24 flex flex-col items-center justify-center text-center text-text-dark py-32 relative [clip-path:polygon(0_0,_100%_0,_100% 0%,_0_100%)]">
        <div className="flex justify-between w-full absolute top-0 left-0 object-cover h-full z-0 select-none pointer-events-none ">
            <img src="./chain-illustration-1.svg" alt="Links Left Illustration" draggable="false"/>
            <img src="./chain-illustration-2.svg" alt="Links Right Illustration" draggable="false" />
        </div>
        <div className="max-w-5xl z-5">
            <h2 className="text-6xl font-bold">
                Your links are nobody's business but yours. And the fox.
            </h2>
            <p className="text-2xl mt-4 font-semibold">
                Start your free-trial today just to test it out. <br/>Don't let anyone invade your privacy. —foxy
            </p>

                <div className="bg-white/50 inline-block mt-10 rounded-full p-2">
                  <Button variant="secondary" size="lg" noOverlay className="text-2xl! outline-2 outline-offset-6 font-semibold gap-4 py-4!">
                  <img src="./foxy-logo-mascot.svg" width={50} className="select-none pointer-events-none" draggable="false" />
                  Let's stay private!
                      <UpRightArrowIcon className="size-8" />
                  </Button>
                </div>
        
        </div>
    </section>
    );
}
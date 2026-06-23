
"use client";

import BroomIcon from '@iconify-react/openmoji/broom';
import CodeEditorIcon from '@iconify-react/openmoji/code-editor';
import LockedIcon from '@iconify-react/openmoji/locked';
import ShieldIcon from '@iconify-react/openmoji/shield';
import Button from '../ui/Button';
import { useState } from 'react';

const FEATURES = [
    {
        title: "Open source",
        icon: CodeEditorIcon
    },
    {
        title: "No logs on Private",
        icon: BroomIcon
    },
    {
        title: "AES-256",
        icon: ShieldIcon
    }, {
        title: "Made with privacy first",
        icon: LockedIcon
    }
]
export function Hero() {
    const [activeOption, setActiveOption] = useState<'private' | 'free'>('private');
    const [pressed, setPressed] = useState<'private' | 'free' | null>(null);

    return (
        <section className="max-w-7xl mx-auto mt-16 flex flex-col items-center justify-center text-center">
            <img src="./foxy-logo.svg" alt="Foxy Logo" srcSet="" className="select-none pointer-event-none w-full h-24" draggable="false" />
            <h1 className="font-coolvetica text-6xl text-text-dark mb-5 ">
                Most shorteners log your links, <br></br> track your clicks, and sell your data
            </h1>
            <p className="text-2xl font-regular max-w-3xl text-subhead mb-12">
                Foxy gives you a choice. Go free with standard shortening. Or upgrade to Zero-Knowledge, where even we can't see where your links go.
            </p>
            <div className='grid grid-cols-4 mb-12'>
                {FEATURES.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={item.title} className="flex items-center w-full justify-center">
                            <div className="flex items-center gap-3 justify-center">
                                <IconComponent className="w-10 h-10 **:fill-brand-primary drop-shadow-[0_0_8px_#FF9720]" />
                                <h3 className="text-text-dark text-xl font-light text-left whitespace-nowrap">
                                    {item.title}
                                </h3>
                            </div>
                            {index < FEATURES.length - 1 && (
                                <span className="hidden md:block text-neutral-300 text-xl font-extralight mx-auto select-none">
                                    |
                                </span>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* Toggle Button */}
            <div className='grid grid-cols-2 bg-gray-1 inset-shadow-sm inset-shadow-black/25 w-125 relative rounded-full p-4 mb-6 '>
                <Button variant='primary' size='lg' pressed={pressed !== null} className={`absolute! top-1/2 -translate-y-1/2 left-4 py-8 w-58.75 transition-transform duration-300 ease-in-out ${activeOption === 'private' ? 'translate-x-0' : 'translate-x-58.25'}`}>
{""}
                </Button>
                <span
                  className={`z-5 text-2xl font-bold py-4 pb-5 px-3 flex items-end justify-center gap-2 cursor-pointer transition-transform duration-150 ease-out ${pressed === 'private' ? 'scale-95 translate-y' : 'scale-100 translate-y-0'}`}
                  onMouseEnter={() => setActiveOption('private')}
                  onClick={() => setActiveOption('private')}
                  onMouseDown={() => setPressed('private')}
                  onMouseUp={() => setPressed(null)}
                  onMouseLeave={() => setPressed(null)}
                >
                    Try <span><img src="./foxy-logo-text.svg" className='select-none' draggable={false} alt="Foxy Text Logo" /></span> Private
                </span>
                <span
                  className={`z-5 text-2xl font-bold py-4 pb-5 px-3 flex items-end justify-center gap-2 cursor-pointer transition-transform duration-150 ease-out ${pressed === 'free' ? 'scale-95 translate-y' : 'scale-100 translate-y-0'}`}
                  onMouseEnter={() => setActiveOption('free')}
                  onClick={() => setActiveOption('free')}
                  onMouseDown={() => setPressed('free')}
                  onMouseUp={() => setPressed(null)}
                  onMouseLeave={() => setPressed(null)}
                >
                    Try <span><img src="./foxy-logo-text.svg" className='select-none' draggable={false} alt="Foxy Text Logo" /></span> for free
                </span>
            </div>

            <div className='text-xl font-sf text-subhead'>
                {activeOption === 'private' ? (
                  <p>
                      Zero-Knowledge encryption. Your URLs never touch our servers. <br /> Not even we can see them.
                  </p>
                ) : (
                  <p>
                      We see your URL. We count your clicks. 7 days.
                  </p>
                )}
            </div>
        </section>
    );
}
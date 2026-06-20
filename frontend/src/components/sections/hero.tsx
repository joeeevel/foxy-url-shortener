
"use client";

import BroomIcon from '@iconify-react/openmoji/broom';
import CodeEditorIcon from '@iconify-react/openmoji/code-editor';
import LockedIcon from '@iconify-react/openmoji/locked';
import ShieldIcon from '@iconify-react/openmoji/shield';
import Button from '../ui/Button';

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

    return (
        <div className="max-w-7xl mx-auto mt-16 flex flex-col items-center justify-center text-center">
            <img src="./foxy-logo.svg" alt="Foxy Logo" srcSet="" className="select-none pointer-event-none w-full h-24" draggable="false" />
            <h1 className="font-coolvetica text-6xl text-text-dark mb-5 ">
                Most shorteners log your links, <br></br> track your clicks, and sell your data
            </h1>
            <p className="text-2xl max-w-3xl text-subhead mb-12">
                Foxy gives you a choice. Go free with standard shortening. Or upgrade to Zero-Knowledge, where even we can't see where your links go.
            </p>
            <div className='grid grid-cols-4 mb-12'>
                {FEATURES.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={item.title} className="flex items-center w-full justify-center">
                            <div className="flex items-center gap-3 justify-center">
                                <IconComponent className="w-10 h-10" />
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
                <Button variant='primary' size='lg' className='absolute! top-1/2 -translate-y-1/2 left-4 py-8 w-[235px]'>

                </Button>
                <span className='z-5 text-2xl font-semibold py-4 px-3'>
                    Try <span className='font-coolvetica font-black tracking-wider'>Foxy</span> Private
                </span>
                <span className='z-5 text-2xl font-semibold py-4 px-3'>
                    Try <span className='font-coolvetica font-black tracking-wider'>Foxy</span> for free
                </span>
            </div>

            <div className='text-xl font-sf'>
                <p>
                    Zero-Knowledge encryption. Your URLs never touch our servers. <br /> Not even we can see them.
                </p>
            </div>
        </div>
    );
}
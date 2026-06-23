'use client';
import { useState } from 'react';

export default function ToggleButton() {
    const [active, setActive] = useState(false);

    return (
        <div
            className={`w-18 inset-shadow-sm inset-shadow-black/25 relative rounded-full p-5 cursor-pointer transition-colors duration-300 ${active ? 'bg-brand-primary' : 'bg-[#DFDFDF]'}`}
            onClick={() => setActive(!active)}
        >
            <span className={`rounded-full bg-white inset-shadow-xs shadow-lg inset-shadow-black/20 p-3.5 absolute top-1/2 -translate-y-1/2 left-1.5 transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${active ? 'translate-x-8' : 'translate-x-0'}`}>{""}</span>
        </div>
    );
}

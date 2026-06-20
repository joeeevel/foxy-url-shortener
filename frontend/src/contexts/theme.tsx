'use client';

import { type ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(){var e=localStorage.getItem('foxy_theme');'light'!==e&&'dark'!==e&&(e=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),document.documentElement.classList.toggle('dark','dark'===e)}()`,
        }}
      />
      {children}
    </>
  );
}

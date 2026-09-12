import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource-variable/outfit';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dyuti Ghosh — Software Engineering & Data Science',
  description: 'Software Engineering student specialising in Engineering Data Science at the University of Sydney. Explore my projects, experience, and leadership.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><script dangerouslySetInnerHTML={{ __html: `
    history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    window.addEventListener('pageshow', function () { window.scrollTo({top: 0, left: 0, behavior: 'instant'}); });
  ` }} /></head><body>{children}</body></html>;
}

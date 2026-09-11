import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dyuti Ghosh — Software Engineering & Data Science',
  description: 'Software Engineering student specialising in Engineering Data Science at the University of Sydney. Explore my projects, experience, and leadership.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

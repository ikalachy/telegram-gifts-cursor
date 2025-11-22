import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plush Gifts - Telegram Mini App',
  description: 'Generate and collect AI-powered plush gifts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers/Providers';

export const metadata: Metadata = {
  title: 'Tasks — Enterprise Project & Workflow Management',
  description:
    'Modern, agile project and workflow management platform inspired by Jira and Linear.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-[100dvh] font-sans antialiased bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

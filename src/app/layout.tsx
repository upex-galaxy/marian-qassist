import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QAssist - Smart Test Case Management for QA Engineers',
  description:
    'Jira-complementary workspace for QA Engineers. Manage test cases, evidence, and testing workflows with local-first data ownership.',
  keywords: [
    'QA',
    'Test Case Management',
    'Jira',
    'Quality Assurance',
    'Testing',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

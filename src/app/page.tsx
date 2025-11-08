import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Reclaim 5 Hours/Week <br />
              <span className="text-primary">Focusing on Testing</span>, Not
              Organization
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              QAssist is a Jira-complementary workspace designed specifically
              for QA Engineers. Professional test case management with
              local-first data ownership.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Bidirectional Jira Sync"
              description="1-click import of User Stories with automatic status updates. Eliminates 30min/day of manual copy-paste."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-8 w-8" />}
              title="Test Case Studio"
              description="HTML editor with professional templates, automatic numbering, and pre-formatted decision tables."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Local-First Data"
              description="Everything auto-saved to your PC. Work offline. Own your testing portfolio forever."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 QAssist. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          HeyAgent CMS
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Admin interface for managing HeyAgent content
        </p>
        <Button asChild size="lg">
          <Link href="/admin">
            Go to Admin Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
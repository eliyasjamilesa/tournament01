import { Suspense } from 'react';
import JoinRedirect from './JoinRedirect';

// Required for static export in Next.js 15
export async function generateStaticParams() {
  // We provide a dummy 'match' param to satisfy the build process for static export
  return [{ id: 'match' }];
}

export default function JoinMatchPlaceholder({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    }>
      <JoinRedirect params={params} />
    </Suspense>
  );
}

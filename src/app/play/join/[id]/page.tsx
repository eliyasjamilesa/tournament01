/**
 * This page is kept to satisfy Next.js static export requirements for dynamic routes.
 * The actual functionality has moved to the query-parameter based route at /play/join.
 */

export function generateStaticParams() {
  // We provide a dummy param so the build succeeds
  return [{ id: 'match' }];
}

export default function JoinMatchPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Redirecting to Arena...</p>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.href = '/play/join?id=' + window.location.pathname.split('/').pop();`
      }} />
    </div>
  );
}

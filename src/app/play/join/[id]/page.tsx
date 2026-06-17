
/**
 * This page is kept for static build compatibility.
 * Redirects dynamic path users to the query-based route.
 */
export function generateStaticParams() {
  return [{ id: 'match' }];
}

export default function JoinMatchPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Redirecting to Arena...</p>
      <script dangerouslySetInnerHTML={{
        __html: `
          const matchId = window.location.pathname.split('/').pop();
          window.location.href = '/play/join?id=' + matchId;
        `
      }} />
    </div>
  );
}

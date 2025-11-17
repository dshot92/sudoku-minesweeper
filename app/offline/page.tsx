export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">You&rsquo;re offline</h1>
      <p className="max-w-md text-muted-foreground">
        It looks like you&rsquo;re not connected to the internet. You can continue playing
        if the current page is cached, or try again once you&rsquo;re back online.
      </p>
    </main>
  );
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block w-full p-4 text-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  )
} 
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

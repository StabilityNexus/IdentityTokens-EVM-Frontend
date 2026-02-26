export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-landing-bg dark:bg-landing-bg-dark">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
    </div>
  );
}

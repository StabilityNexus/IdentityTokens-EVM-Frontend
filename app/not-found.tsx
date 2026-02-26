import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-landing-bg p-4 text-center dark:bg-landing-bg-dark">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-landhead-text-dark">
        404 - Not Found
      </h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Could not find the requested resource.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-[24.85px] bg-brand-blue px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-blue-hover focus:ring-2 focus:ring-brand-blue/20 focus:outline-none"
      >
        Return Home
      </Link>
    </div>
  );
}

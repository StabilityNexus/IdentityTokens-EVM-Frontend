import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main
      className={`mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </main>
  );
}

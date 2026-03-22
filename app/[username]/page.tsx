"use client";
import React, { use } from "react";

export default function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg">
      <h1 className="font-utsaha text-2xl font-semibold text-white">
        @{username}
      </h1>
    </main>
  );
}

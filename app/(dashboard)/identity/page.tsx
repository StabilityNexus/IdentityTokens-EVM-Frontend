import React from "react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/Button";

export default function IdentityPage() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] items-center justify-center py-12 md:py-24">
      <div className="flex w-full max-w-lg flex-col items-center justify-center space-y-8 rounded-3xl bg-white p-8 shadow-xl md:p-12 dark:bg-dark-bg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="font-utsaha text-4xl font-bold tracking-tight text-brand-blue md:text-5xl dark:text-white">
            Mint Your DIT
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Create your Decentralized Identity Token to start exploring the
            Stability Nexus ecosystem. Secure, unique, and entirely yours.
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-[#15161A]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Network</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Sepolia
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Mint Fee</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Free
              </span>
            </div>
          </div>

          <Button className="w-full py-4 text-lg">Mint Identity</Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          By minting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </PageContainer>
  );
}

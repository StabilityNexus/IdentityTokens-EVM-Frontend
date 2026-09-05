import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | Decentralized Identity Token",
  description:
    "Privacy Policy for the Decentralized Identity Token (DIT) application by Stability Nexus. Learn how DIT handles your information with a privacy-conscious, local-first approach.",
  openGraph: {
    title: "Privacy Policy | Decentralized Identity Token",
    description:
      "Privacy Policy for the Decentralized Identity Token (DIT) application. Learn how DIT handles your information with a privacy-conscious, local-first approach.",
    url: "https://dit.stability.nexus/privacy-policy",
    siteName: "Stability Nexus DIT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Decentralized Identity Token",
    description:
      "Privacy Policy for the Decentralized Identity Token (DIT) application by Stability Nexus.",
  },
  alternates: {
    canonical: "https://dit.stability.nexus/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen w-full bg-landing-bg dark:bg-landing-bg-dark">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-landing-bg dark:bg-landing-bg-dark">
        <div className="mx-auto flex h-16 w-full max-w-[1512px] items-center justify-between px-4 md:h-[80px] md:px-[56px]">
          <Link href="/" className="flex items-center gap-2 md:gap-[17px]">
            <div className="relative h-8 w-8 md:h-10 md:w-10">
              <Image
                src="/assets/logo.svg"
                alt="DIT Logo"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/assets/dark-logo.svg"
                alt="DIT Logo Dark"
                fill
                className="hidden object-contain dark:block"
              />
            </div>
            <span className="pt-1 font-atyp text-2xl leading-none text-black md:pt-2 md:text-[40px] dark:text-white">
              dit
            </span>
          </Link>
          <Link
            href="/"
            className="font-utsaha text-sm text-black/70 underline underline-offset-2 transition-colors hover:text-black md:text-base dark:text-white/70 dark:hover:text-white"
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Policy Content */}
      <article className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-20">
        <h1 className="mb-8 font-utsaha text-3xl tracking-tight text-black md:text-5xl dark:text-white">
          Privacy Policy
        </h1>

        <div className="space-y-8 font-garamond text-base leading-relaxed text-black/80 md:text-lg dark:text-white/80">
          {/* Introduction */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Introduction
            </h2>
            <p>
              Decentralized Identity Token (the &ldquo;App&rdquo;) is committed
              to protecting your privacy and providing a transparent and
              user-friendly experience.
            </p>
            <p className="mt-3">
              This Privacy Policy explains how the App handles information when
              you use it.
            </p>
            <p className="mt-3">
              The App follows a privacy-conscious and local-first approach. It
              aims to collect and process only the information necessary to
              provide its functionalities. Where possible, information is
              processed and stored locally on your device rather than being
              transmitted to or stored on remote servers.
            </p>
          </section>

          {/* Information and Permissions */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Information and Permissions
            </h2>
            <p>
              Depending on the features you use and the permissions you grant,
              the App may access information such as:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Information you provide directly to the App</li>
              <li>Information generated through your use of the App</li>
              <li>
                Device information or permissions required for specific features
              </li>
              <li>
                Blockchain wallet addresses and on-chain identity data required
                to mint and manage your Decentralized Identity Token
              </li>
            </ul>
            <p className="mt-3">
              The information accessed by the App is used only for the purposes
              described in this Privacy Policy and to provide the functionality
              of the App.
            </p>
            <p className="mt-3">
              You can deny or revoke permissions at any time through your device
              settings. Some features may not work if the permissions required
              for those features are not granted.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Data Storage
            </h2>
            <p>
              The App is designed to minimize the storage and transmission of
              personal information.
            </p>
            <p className="mt-3">
              <strong>Public On-Chain Data:</strong> Identity tokens, Profile
              tokens, chosen usernames, associated metadata (such as custom
              links or bio fields), and peer-to-peer attestations are written
              directly to public EVM-compatible blockchains. This data is
              permanent, immutable, and publicly accessible by design. Users
              should only publish information they are comfortable making
              permanently public. No personal data is stored on centralized,
              private databases operated by the App.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Data Sharing
            </h2>
            <p>The App does not sell your personal information.</p>
            <p className="mt-3">
              The App does not use personal information for targeted
              advertising.
            </p>
            <p className="mt-3">
              The App may communicate with third-party services when required to
              provide specific features. Any information transmitted to such
              services is limited to what is necessary for the App&rsquo;s
              functionality. The following is a list of third parties and the
              information that may be shared with them:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>
                  Blockchain Networks (e.g., Ethereum, EVM-compatible chains):
                </strong>{" "}
                Wallet addresses and transaction data necessary to mint, manage,
                and verify your Decentralized Identity Token.
              </li>
              <li>
                <strong>
                  Wallet Providers (e.g., MetaMask, WalletConnect):
                </strong>{" "}
                Wallet connection information required to authenticate and sign
                transactions.
              </li>
              <li>
                <strong>RPC Node Providers:</strong> To read from and broadcast
                transactions to supported blockchains (e.g., Ethereum Sepolia),
                the App connects to remote procedure call (RPC) nodes. These
                third-party node providers may process network-level information
                (such as your IP address) in accordance with their respective
                privacy policies.
              </li>
              <li>
                <strong>Static Hosting Infrastructure (GitHub Pages):</strong>{" "}
                The App frontend is served as a client-side static application
                hosted via GitHub Pages. GitHub may collect basic server logs
                (such as IP addresses and request headers) for security and
                operational purposes.
              </li>
            </ul>
            <p className="mt-3">
              Where a third-party processes information, its handling of that
              information is governed by its own privacy policy and terms of
              service.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Data Security
            </h2>
            <p>
              The App aims to minimize privacy and security risks by limiting
              unnecessary data collection and, where possible, processing
              information locally on your device.
            </p>
            <p className="mt-3">
              However, no method of electronic storage or transmission can be
              guaranteed to be completely secure. Users are also responsible for
              maintaining the security of their devices and for protecting any
              information they choose to export, share, or otherwise make
              available.
            </p>
          </section>

          {/* Data Deletion */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Data Deletion
            </h2>
            <p>
              Where information is cached locally on your device (such as
              temporary session state or recent query caches in browser
              storage), you can delete it immediately by clearing your
              browser&rsquo;s cookies and site storage, or by disconnecting your
              wallet.
            </p>
            <p className="mt-3">
              <strong>Blockchain Immutability:</strong> Because blockchain
              ledgers are decentralized and append-only, records that have been
              confirmed on-chain (including minted DIT tokens, Profile tokens,
              and attestations) cannot be altered, overwritten, or deleted by
              the App or any third party.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Children&rsquo;s Privacy
            </h2>
            <p>
              The App is not intended to knowingly collect personal information
              from children where such collection is prohibited by applicable
              law.
            </p>
          </section>

          {/* Free Access */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Free Access
            </h2>
            <p>
              The App aims to keep its core functionality accessible to users
              without requiring mandatory subscriptions or payments to unlock
              essential features. Blockchain transaction fees (gas fees) are
              determined by the underlying network and are not controlled by the
              App.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes to the App, its functionality, or applicable legal
              requirements.
            </p>
            <p className="mt-3">
              Any updates will be made available wherever this Privacy Policy is
              published.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 font-utsaha text-xl text-black md:text-2xl dark:text-white">
              Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              the App&rsquo;s privacy practices, please contact us at:
            </p>
            <p className="mt-3">
              <a
                href="mailto:contact@aossie.org"
                className="text-brand-blue underline underline-offset-2 transition-colors hover:text-brand-blue-hover"
              >
                contact@aossie.org
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

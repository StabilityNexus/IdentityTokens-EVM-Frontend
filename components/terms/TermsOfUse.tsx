import React from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { TERMS_VERSION } from "@/lib/onboarding";

export const TERMS_EFFECTIVE_DATE = "31 October 2026";

/** Pinned to version 2.98, so an upstream edit can't change what was accepted. */
const ORG_TERMS_URL =
  "https://github.com/StabilityNexus/Info/blob/cdccf7a066bd16829b42f6e7353a7cb360a7bf57/TermsOfUse.md";
const DEPLOYMENTS_URL =
  "https://github.com/StabilityNexus/IdentityTokens-EVM-Contracts/blob/main/Deployment.md";
const REPO_URL =
  "https://github.com/StabilityNexus/IdentityTokens-EVM-Frontend";

function External({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-blue-link underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  );
}

const Email = ({ to }: { to: string }) => (
  <External href={`mailto:${to}`}>{to}</External>
);

const SECTIONS: { title: string; points: React.ReactNode[] }[] = [
  {
    title: "What DIT is",
    points: [
      "DIT runs entirely in your browser. It reads public blockchain data and helps you build transactions. Your wallet signs and sends them.",
      "We do not run a server, a wallet or a blockchain, and we are not a party to any transaction you send.",
      "DIT is experimental and may contain errors. It is currently deployed on test networks such as Sepolia, where tokens have no monetary value.",
      "When the contracts are redeployed, identities, tokens, profiles and attestations from an earlier deployment are not carried over.",
    ],
  },
  {
    title: "Your identity is public and permanent",
    points: [
      "Your display name, username, profile details, links, tokens, attestations and flags are recorded on a public blockchain. Anyone can read them, and nobody can delete them: not you, and not us.",
      "Editing your profile or burning a token adds a new record. Earlier values stay in the blockchain's history.",
      "Your wallet address can be linked to you. Only publish what you are willing to make public permanently, and never publish personal information about someone else.",
    ],
  },
  {
    title: "What you must not do",
    points: [
      "Do not impersonate any person or organisation, or use a name, username or token that you have no right to use.",
      "Do not publish content that is unlawful, that infringes someone else's rights, or that exposes another person's private information.",
      "Usernames are first come, first served. Nobody reviews or reserves them, and nobody can take one back or hand one to you.",
    ],
  },
  {
    title: "Attestations and flags",
    points: [
      "An attestation is a statement made by another user. It is not a verification, certification or endorsement by Stability Nexus or by DIT. A DIT identity or token is not an official or government identity document.",
      "Only attest to what you believe is true. You can revoke your own attestation, and the revocation is public too.",
      "Flags are public and permanent and cannot be withdrawn. Do not flag in bad faith. The contracts can also flag a token automatically, for example when many of its attestations are revoked.",
    ],
  },
  {
    title: "Tokens, transfers and burning",
    points: [
      "Your identity (id-…) cannot be transferred. Other tokens, including your profile, can be sent to another wallet.",
      "The new holder receives the token and everything recorded with it, including its attestations. For a profile, that includes its username, details and links.",
      "A wallet can create only one profile. If you transfer or burn yours, that wallet cannot create another.",
      "Burning destroys a token permanently.",
    ],
  },
  {
    title: "Fees and donations",
    points: [
      "Every transaction costs a network fee (gas). It goes to the blockchain, not to us.",
      "Where the contracts support it, an action can include an optional donation to AOSSIE. DIT ticks the donation box by default: untick it before you confirm if you do not want to donate. A donation is sent with your transaction and cannot be refunded.",
      "Confirmed transactions are final. Nobody can reverse, cancel or refund them.",
    ],
  },
  {
    title: "Who controls the contracts",
    points: [
      "The contracts are immutable: nobody can change their code after deployment, including us.",
      "They have limited privileged roles. An admin links the two contracts once, at deployment. Where donations are supported, a dev role can change the donation rate, within a limit fixed in the contract, and the address that receives donations.",
      "No role can change, move or delete your identity, tokens, profile or attestations.",
      <>
        Check the official contract addresses in the{" "}
        <External href={DEPLOYMENTS_URL}>deployments list</External> before you
        rely on them.
      </>,
    ],
  },
  {
    title: "Your wallet and keys",
    points: [
      "DIT is non-custodial. We never hold your assets and never ask for your recovery phrase or private keys. Anyone who asks is trying to defraud you.",
      "You are responsible for the security of your wallet and your device. If you lose access to your wallet, you lose control of your identity and tokens, and nobody can recover them.",
    ],
  },
  {
    title: "No warranty and no advice",
    points: [
      "DIT and its contracts are provided “as is” and “as available”, without warranty of any kind. They may be unavailable, change or be withdrawn at any time, without notice. Nobody provides support or is obliged to fix errors.",
      "Nothing in DIT is legal, financial or tax advice.",
      "You use DIT at your own risk. For example: the network may be congested, fork or stop; the contracts or the interface may have bugs; a compromised domain or dependency may serve a modified interface; and wallets, RPC providers or other third-party services may fail.",
    ],
  },
  {
    title: "Liability and disputes",
    points: [
      <>
        To the maximum extent the law allows, no Stability Nexus contributor or
        other user is liable for any loss arising from your use of DIT,
        including lost tokens, data or access. The full exclusions and limits
        are in sections 22 to 25 of the{" "}
        <External href={ORG_TERMS_URL}>Stability Nexus Terms of Use</External>.
      </>,
      "Nothing in these terms limits a liability that the law does not allow to be limited, or removes your rights as a consumer.",
      "The governing law and how disputes are handled are set out in the Stability Nexus Terms of Use.",
    ],
  },
  {
    title: "Third-party services and privacy",
    points: [
      "DIT relies on third-party services to work, such as your wallet, wallet-connection services, blockchain RPC providers and website hosting. They receive technical data such as your IP address, and some receive your wallet address. Their own terms and privacy policies apply.",
      <>
        DIT keeps a few settings in your browser, for example that you accepted
        these terms. The{" "}
        <Link
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue-link underline underline-offset-2 hover:opacity-80"
        >
          Privacy Policy
        </Link>{" "}
        explains what DIT handles.
      </>,
    ],
  },
  {
    title: "The law, open source and copies",
    points: [
      "You are responsible for following the laws that apply to you. Do not use DIT if you are subject to sanctions, or where using it is unlawful.",
      "DIT is open source: the interface under the MIT License and the contracts under GPL-3.0. Anyone can copy, fork or redeploy it, and copies we did not publish are not ours. Start from dit.stability.nexus.",
    ],
  },
  {
    title: "Changes and contact",
    points: [
      "These terms may change. DIT may ask you to accept a new version. If you do not accept it, stop using DIT.",
      <>
        Questions: our <External href={SOCIAL_LINKS.discord}>Discord</External>{" "}
        or the <External href={REPO_URL}>DIT repository</External>. Security
        reports: <Email to="security@stability.nexus" />. Legal notices:{" "}
        <Email to="legal@stability.nexus" />. Privacy:{" "}
        <Email to="privacy@stability.nexus" />.
      </>,
    ],
  },
];

/** DIT's Terms of Use, which take in the Stability Nexus Terms of Use. */
export function TermsOfUse() {
  return (
    <div className="flex flex-col gap-5 font-utsaha text-sm leading-relaxed text-gray-400">
      <p className="text-xs text-gray-500">
        Version {TERMS_VERSION} · Effective {TERMS_EFFECTIVE_DATE}
      </p>
      <p>
        DIT (dit.stability.nexus) is an open-source interface for the
        Decentralized Identity Token smart contracts, published by Stability
        Nexus contributors. These terms cover your use of DIT. The{" "}
        <External href={ORG_TERMS_URL}>
          Stability Nexus Terms of Use (version 2.98)
        </External>{" "}
        also apply and form part of these terms; if the two conflict, the
        Stability Nexus Terms of Use prevail. If you do not agree, do not use
        DIT.
      </p>
      {SECTIONS.map((section, i) => (
        <section key={section.title}>
          <h3 className="mb-2 text-base text-white">
            {i + 1}. {section.title}
          </h3>
          <ul className="list-disc space-y-1.5 pl-5">
            {section.points.map((point, j) => (
              <li key={j}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

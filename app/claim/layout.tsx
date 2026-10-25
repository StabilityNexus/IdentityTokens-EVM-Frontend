import type { Metadata } from "next";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

const TITLE = "Claim your DIT username";
const DESCRIPTION =
  "Reserve a username for your DIT identity. Connect a wallet, choose a name, and mint a root identity token. Usernames cannot be changed after minting.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/claim",
});

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: absoluteUrl("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Claim your username",
      item: absoluteUrl("/claim"),
    },
  ],
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd data={breadcrumbs} />
      {children}
    </>
  );
}

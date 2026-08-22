import Image from "next/image";
import { BadgeProps, RankName } from "@/lib/types";

const BADGE_MAP: Record<RankName, string> = {
  bronze: "/badges/BronzeBadge.svg",
  silver: "/badges/SilverBadge.svg",
  gold: "/badges/GoldBadge.svg",
  platinum: "/badges/PlatinumBadge.svg",
  diamond: "/badges/DiamondBadge.svg",
  champion: "/badges/ChampionBadge.svg",
};

const Badge: React.FC<BadgeProps> = ({ rank, size = 48, className = "" }) => {
  const badgeSrc = BADGE_MAP[rank.toLowerCase() as RankName];

  if (!badgeSrc) {
    console.warn(`Badge not found for rank: ${rank}`);
    return null;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={badgeSrc}
        alt={`${rank} badge`}
        fill
        className="object-contain"
      />
    </div>
  );
};

export default Badge;

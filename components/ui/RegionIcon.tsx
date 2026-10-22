import React from "react";
import { MapPin } from "lucide-react";
import { Region, countryFlag } from "@/lib/countries";

/** A country's flag, or a pin for a custom region. */
export function RegionIcon({ region }: { region: Region }) {
  return region.code ? (
    <span aria-hidden="true" className="text-base leading-none">
      {countryFlag(region.code)}
    </span>
  ) : (
    <MapPin size={14} aria-hidden="true" className="shrink-0" />
  );
}

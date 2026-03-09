import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-brand-green text-black hover:bg-green-400 border border-transparent font-medium shadow-none",
    secondary: "bg-white text-black border border-gray-200 hover:bg-gray-50",
    outline:
      "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-[24.85px]",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center transition-colors focus:ring-2 focus:ring-brand-blue/20 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

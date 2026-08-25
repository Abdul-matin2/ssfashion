"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoColor = "default" | "light" | "dark";

export function Logo({
  className,
  size = "md",
  color = "default",
  href,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: LogoColor;
  href?: string;
}) {
  const sizeStyles = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const ampersandStyles = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const colorStyles = {
    default: "text-brand-black",
    light: "text-brand-white",
    dark: "text-brand-black",
  };

  const fashionColorStyles = {
    default: "text-brand-gold",
    light: "text-brand-gold",
    dark: "text-brand-gold",
  };

  const textColor = colorStyles[color];
  const fashionColor = fashionColorStyles[color];

  const logoContent = (
    <>
      <span className={cn("font-black", sizeStyles[size])}>S</span>
      <span
        className={cn("font-light", fashionColor, ampersandStyles[size])}
        aria-hidden="true"
      >
        &
      </span>
      <span className={cn("font-black", sizeStyles[size])}>S</span>
      <span className={cn("font-medium ml-1", fashionColor, sizeStyles[size])}>
        FASHION
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-baseline gap-1 font-bold tracking-tight no-underline",
          textColor,
          className
        )}
        aria-label="S&S FASHION - Home"
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        "flex items-baseline gap-1 font-bold tracking-tight",
        textColor,
        className
      )}
      aria-label="S&S FASHION"
    >
      {logoContent}
    </span>
  );
}
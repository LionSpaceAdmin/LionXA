"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useTranslations } from "next-intl";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        active: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 dark:border-green-500/20",
        paused: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-500/20",
        error: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500/20",
        offline: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-500/20",
      },
    },
    defaultVariants: {
      status: "offline",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "active" | "paused" | "error" | "offline";
  pulse?: boolean;
}

export function StatusBadge({
  className,
  status,
  pulse = false,
  ...props
}: StatusBadgeProps) {
    const t = useTranslations('Statuses');
    const translatedStatus = t(status);

  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      <div
        className={cn(
          "mr-1.5 h-2 w-2 rounded-full",
          status === "active" && "bg-green-500",
          status === "paused" && "bg-yellow-500",
          status === "error" && "bg-red-500",
          status === "offline" && "bg-gray-500",
          pulse && status === "active" && "animate-pulse"
        )}
      />
      {translatedStatus}
    </span>
  );
}

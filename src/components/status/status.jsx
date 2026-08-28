import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Status = ({ variant = "default", size = "default", className }) => {
  return (
    <div className={`fl gap-2 ${className}`}>
      <span
        className={cn(
          statusVariants({
            variant: variant.toLowerCase(),
            size,
          })
        )}
      ></span>
      {variant[0].toUpperCase() + variant.slice(1).toLowerCase()}
    </div>
  );
};

export default Status;

const statusVariants = cva("block", {
  variants: {
    variant: {
      default: "bg-primary",
      hold: "bg-yellow-500",
      live: "bg-green-500",
      archived: "bg-red-300",
      pending: "bg-yellow-500",
      failed: "bg-red-500",
      completed: "bg-green-500",
      reviewed: "bg-green-500",
      active: "bg-green-500",
      cancelled: "dark:bg-white/50 bg-black/40",
    },
    size: {
      default: "h-2 w-2 rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

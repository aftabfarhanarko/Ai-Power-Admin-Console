import React from "react";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  children,
  className,
  variant = "default",
  size = "default",
  onPrimary = false,
  isLoading = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
          onPrimary,
          className,
        })
      )}
      {...props}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default PrimaryButton;

const buttonVariants = cva("border font-medium rounded-full select-none tr", {
  variants: {
    variant: {
      default:
        "border-black text-white bg-black hover:bg-black/90",
      secondary:
        "border-black text-white bg-black hover:bg-black/90",
      primary:
        "border-black text-white bg-black hover:bg-black/90",
      accent:
        "bg-black text-white hover:bg-black/90",
      rubix: "bg-black text-white hover:bg-black/90",
      outline:
        "border-black text-white bg-black hover:bg-black/90 tr",
    },
    size: {
      default: "py-3 px-4",
      xs: "py-2 px-3 text-xs",
      sm: "py-2.5 px-5 text-sm",
    },
    onPrimary: {
      true: "hover:bg-black/90",
      false: "",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

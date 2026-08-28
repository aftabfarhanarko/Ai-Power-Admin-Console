import { svgArrowDown, svgArrowDownWhite } from "@/assets/icons/svgIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

const Dropdown = ({
  children,
  name = "options",
  options,
  setSelectedOption,
  primary = false,
  className,
  triggerClassName,
}) => {
  return (
    <DropdownMenu className={(e) => e.stopPropagation()}>
      <DropdownMenuTrigger
        className="outline-none w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={
            triggerClassName ||
            `py-1.5 pl-4 pr-2.5 text-sm border flex items-center justify-between gap-2 select-none rounded-lg ${
              primary
                ? "border-white/75 text-white"
                : "border-black/15 dark:border-white/20 text-black dark:text-white/75"
            } ${className} w-full`
          }
        >
          {children}
          <span className="hidden dark:block">{svgArrowDownWhite}</span>
          <span className="dark:hidden">{primary ? svgArrowDownWhite : svgArrowDown}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-medium">
          Select {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options?.map((option, index) => (
          <DropdownMenuItem
            className={`${option?.icon && "gap-1.5"} w-full`}
            key={index}
            onClick={() => setSelectedOption(option)}
          >
            <span className="scale-[0.85] ">{option?.icon}</span>
            {option?.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;

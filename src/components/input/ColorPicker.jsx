import React from "react";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ColorPicker = ({ value, onChange, label, error, placeholder = "#000000" }) => {
    const handleColorChange = (color) => {
        onChange(color.hex);
    };

    return (
        <div className="space-y-1">
            {label && (
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="h-10 w-20 rounded border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: value || placeholder }}
                        />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0 shadow-lg bg-white dark:bg-[#1a1f26]" align="start">
                        <div className="[&_.sketch-picker]:shadow-none [&_.sketch-picker]:bg-transparent">
                            <SketchPicker
                                color={value || placeholder}
                                onChange={handleColorChange}
                                disableAlpha
                            />
                        </div>
                    </PopoverContent>
                </Popover>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                />
                {value && /^#[0-9A-F]{6}$/i.test(value) && (
                    <div
                        className="w-10 h-10 rounded border border-black/20 dark:border-white/20"
                        style={{ backgroundColor: value }}
                        title={value}
                    />
                )}
            </div>
            {error && (
                <span className="text-red-500 text-xs ml-1">
                    {error.message}
                </span>
            )}
            <p className="text-xs text-black/50 dark:text-white/50">
                Select or enter a hex color code (e.g., {placeholder})
            </p>
        </div>
    );
};

export default ColorPicker;

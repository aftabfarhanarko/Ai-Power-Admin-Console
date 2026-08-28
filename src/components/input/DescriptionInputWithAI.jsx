import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useSuggestDescriptionMutation } from "@/features/dashboard/dashboardApiSlice";
import { Sparkles } from "lucide-react";
import { useSelector } from "react-redux";

/**
 * Description input with AI suggestion button.
 * Supports Bangla, Minglish (Romanized Bangla), and English.
 * Works with react-hook-form Controller: <Controller name="description" control={control} render={({ field }) => <DescriptionInputWithAI {...field} />} />
 * @param {Object} props
 * @param {string} props.value - Current value
 * @param {function} props.onChange - (e) => void - standard input onChange
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.rows - Textarea rows
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.type - AI context type: 'product' | 'promocode' | 'package' | 'general'
 * @param {string} props.title - Product/context title for AI (e.g. product name)
 */
const DescriptionInputWithAI = ({
  value = "",
  onChange,
  placeholder = "Enter description",
  rows = 4,
  label = "Description",
  error,
  type = "product",
  title = "",
}) => {
  const { t } = useTranslation();
  const [suggestDescription, { isLoading: isSuggesting }] = useSuggestDescriptionMutation();
  const authUser = useSelector((state) => state.auth.user);
  const [descriptionLang, setDescriptionLang] = useState("en"); // "en" | "bn" | "bn-Latn"

  const handleAiSuggest = async () => {
    try {
      const res = await suggestDescription({
        body: { context: value || undefined, type, title, lang: descriptionLang },
        params: { companyId: authUser?.companyId },
      }).unwrap();
      const suggestion = res?.suggestion || "";
      if (suggestion && onChange) {
        onChange({ target: { value: suggestion } });
      }
    } catch (err) {
      console.error("AI suggestion failed:", err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-black/80 dark:text-white/80">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50/50 dark:bg-black/20">
            <button
              type="button"
              onClick={() => setDescriptionLang("en")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                descriptionLang === "en"
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800"
              }`}
              title={t("aiDescription.english") || "English"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setDescriptionLang("bn")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                descriptionLang === "bn"
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800"
              }`}
              title={t("aiDescription.bangla") || "Bangla"}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setDescriptionLang("bn-Latn")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                descriptionLang === "bn-Latn"
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800"
              }`}
              title={t("aiDescription.minglish") || "Minglish (Bangla in English letters)"}
            >
              Minglish
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiSuggest}
            disabled={isSuggesting}
            className="text-xs gap-2 h-9 px-4 rounded-xl border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 font-bold"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSuggesting ? "animate-spin" : ""}`} />
            {isSuggesting ? t("aiDescription.generating") || "Generating..." : t("aiDescription.generateWithAI") || "Generate with AI"}
          </Button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50/50 dark:bg-black/20 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 placeholder:font-normal text-gray-900 dark:text-white ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-700"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DescriptionInputWithAI;

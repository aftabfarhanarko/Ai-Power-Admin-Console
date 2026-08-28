import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Download, Volume2, Square } from "lucide-react";
import GlassCard from "./GlassCard";

const AIInsightsSection = ({
  isLoading,
  isError,
  hasReport,
  paragraphs,
  displayText,
  isTranslating,
  reportLang,
  isSpeaking,
  handleTranslate,
  handleSpeak,
  handleStopSpeak,
  handleDownloadReport,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1">
      <GlassCard className="p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        {/* Decorative background effects */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("aiReport.aiInsights")}
            </h2>
          </div>

          {isLoading && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              {t("common.loading") || "Loading..."}
            </div>
          )}

          {isError && (
            <div className="py-12 text-center text-rose-500 dark:text-rose-400">
              {t("common.error") || "Failed to load AI report."}
            </div>
          )}

          {!isLoading && !isError && hasReport && (
            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {paragraphs.length > 0 ? (
                  paragraphs.map((para, idx) => (
                    <p key={idx} className="text-lg leading-relaxed">
                      {para.trim()}
                    </p>
                  ))
                ) : (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {displayText}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => handleTranslate("bn")}
                  disabled={isTranslating || reportLang === "bn"}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {t("aiReport.translateToBengali") || "Translate to Bengali"}
                </button>
                <button
                  onClick={() => handleTranslate("en")}
                  disabled={isTranslating || reportLang === "en"}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {t("aiReport.translateToEnglish") || "Translate to English"}
                </button>
                <button
                  onClick={() => handleTranslate("bn-Latn")}
                  disabled={isTranslating || reportLang === "bn-Latn"}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {t("aiReport.translateToMinglish") ||
                    "Translate to Minglish (Bangla in English letters)"}
                </button>

                {isSpeaking ? (
                  <button
                    onClick={handleStopSpeak}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" /> {t("aiReport.stopSpeaking")}
                  </button>
                ) : null}
                
                {!isSpeaking && (
                  <>
                    <button
                      onClick={() => handleSpeak("en")}
                      className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />{" "}
                      {t("aiReport.listenEnglish") || t("aiReport.listen")}
                    </button>
                    <button
                      onClick={() => handleSpeak("bn")}
                      className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />{" "}
                      {t("aiReport.listenBengali") || t("aiReport.listen")}
                    </button>
                  </>
                )}

                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-medium flex items-center gap-2 ml-auto"
                >
                  <Download className="w-4 h-4" /> {t("aiReport.downloadPdf")}
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default AIInsightsSection;

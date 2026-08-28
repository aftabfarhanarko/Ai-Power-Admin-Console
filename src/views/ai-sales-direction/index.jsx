import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiSalesDirectionQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import toast from "react-hot-toast";
import {
  FloatingParticles,
  HeaderSection,
  ControlsSection,
  StatusSection,
  ContentSection,
} from "./components";

const AiSalesDirectionPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [langMode, setLangMode] = useState("original");
  const [translatedDirections, setTranslatedDirections] = useState([]);

  const { data, isLoading, isError } = useGetAiSalesDirectionQuery(
    { companyId: authUser?.companyId },
    {
      skip: !authUser?.companyId,
      pollingInterval: 0,
    },
  );

  const [translateReport, { isLoading: isTranslating }] =
    useTranslateReportMutation();

  const directions = data?.directions ?? (Array.isArray(data) ? data : []);
  const generatedAt = data?.generatedAt;
  const hasDirections = Array.isArray(directions) && directions.length > 0;

  const handleTranslate = async (targetLang) => {
    if (!hasDirections) return;
    try {
      const results = await Promise.all(
        directions.map(async (dir) => {
          const title = dir?.title ?? t("aiSalesDirection.action");
          const action = dir?.action ?? "";
          const text = `${title}\n${action}`.trim();
          const res = await translateReport({ text, targetLang }).unwrap();
          const translated = res?.translatedText ?? text;
          const [tTitle, ...tActionParts] = translated.split("\n");
          return {
            title: tTitle?.trim() ?? title,
            action: tActionParts.join("\n").trim() || action,
          };
        }),
      );
      setTranslatedDirections(results);
      setLangMode(targetLang);
      const successMsg =
        targetLang === "bn"
          ? t("aiReport.translatedToBengali") || "Translated to Bengali"
          : targetLang === "bn-Latn"
            ? t("aiReport.translatedToMinglish") || "Translated to Minglish"
            : t("aiReport.translatedToEnglish") || "Translated to English";
      toast.success(successMsg);
    } catch (err) {
      toast.error(t("aiReport.translateFailed") || "Translation failed");
    }
  };

  const getDisplayDirection = (idx) =>
    langMode === "original" ? null : translatedDirections[idx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] p-4 sm:p-6 lg:p-10 overflow-x-hidden relative">
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Premium Header Section */}
      <HeaderSection t={t} />

      <div className="max-w-3xl lg:max-w-[1400px] mx-auto relative z-10">
        {/* Premium Controls */}
        <ControlsSection
          generatedAt={generatedAt}
          langMode={langMode}
          handleTranslate={handleTranslate}
          isTranslating={isTranslating}
          hasDirections={hasDirections}
          t={t}
        />

        {/* Content Area */}
        {isLoading || isError || !hasDirections ? (
          <StatusSection
            isLoading={isLoading}
            isError={isError}
            hasDirections={hasDirections}
            t={t}
          />
        ) : (
          <ContentSection
            directions={directions}
            getDisplayDirection={getDisplayDirection}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default AiSalesDirectionPage;

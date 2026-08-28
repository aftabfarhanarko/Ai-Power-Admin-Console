import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslateReportMutation } from "@/features/dashboard/dashboardApiSlice";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { formatDateTime } from "@/utils/banglaFormatter";

export function useReportText(data, currentLang) {
  const { t } = useTranslation();
  const [reportLang, setReportLang] = useState("original");
  const [translatedText, setTranslatedText] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);
  const isUserStoppedRef = useRef(false);

  const [translateReport, { isLoading: isTranslating }] =
    useTranslateReportMutation();

  const reportText = data?.report ?? (typeof data === "string" ? data : null);
  const generatedAt = data?.generatedAt;
  const hasReport = reportText && reportText.trim().length > 0;

  const displayText =
    reportLang === "original" ? reportText : (translatedText ?? reportText);

  const paragraphs = displayText
    ? displayText
        .trim()
        .split(/\n\n+/)
        .filter((p) => p.trim())
    : [];

  const getTextForLang = (targetLang) => {
    if (targetLang === "en") {
      if (reportLang === "en" || reportLang === "original")
        return reportLang === "en"
          ? (translatedText ?? reportText)
          : reportText;
      return null;
    }
    if (targetLang === "bn") {
      if (reportLang === "bn") return translatedText ?? reportText;
      return null;
    }
    return null;
  };

  const handleTranslate = async (targetLang) => {
    if (!reportText?.trim()) return;
    try {
      const res = await translateReport({
        text:
          reportLang === "original"
            ? reportText
            : (translatedText ?? reportText),
        targetLang,
      }).unwrap();
      setTranslatedText(res?.translatedText ?? reportText);
      setReportLang(targetLang);
      toast.success(
        { bn: t("aiReport.translatedToBengali") || "Translated to Bengali", "bn-Latn": t("aiReport.translatedToMinglish") || "Translated to Minglish", en: t("aiReport.translatedToEnglish") || "Translated to English" }[targetLang]
      );
    } catch (err) {
      toast.error(t("aiReport.translateFailed") || "Translation failed");
    }
  };

  const handleSpeak = async (targetLang) => {
    if (!reportText?.trim()) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error(
        t("aiReport.speakNotSupported") ||
          "Text-to-speech is not supported in your browser.",
      );
      return;
    }
    let textToSpeak = getTextForLang(targetLang);
    if (!textToSpeak) {
      try {
        const res = await translateReport({
          text:
            reportLang === "original"
              ? reportText
              : (translatedText ?? reportText),
          targetLang,
        }).unwrap();
        textToSpeak = res?.translatedText ?? reportText;
        if (targetLang === "bn") {
          setTranslatedText(textToSpeak);
          setReportLang("bn");
        } else if (targetLang === "en") {
          setTranslatedText(textToSpeak);
          setReportLang("en");
        }
      } catch (err) {
        toast.error(t("aiReport.translateFailed") || "Translation failed");
        return;
      }
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === "bn" ? "bn-BD" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => {
      setIsSpeaking(false);
      isUserStoppedRef.current = false;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      isUserStoppedRef.current = false;
    };
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    toast.success(targetLang === "bn" ? (t("aiReport.listeningBengali") || "Listening in Bangla") : (t("aiReport.listeningEnglish") || "Listening in English"));
  };

  const handleStopSpeak = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      isUserStoppedRef.current = true;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.success(t("aiReport.speakStopped"));
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDownloadReport = () => {
    if (!displayText) return;
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(t("nav.aiDailyReport") || "AI Daily Report", margin, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const generatedDate = generatedAt
        ? formatDateTime(generatedAt, currentLang)
        : formatDateTime(new Date(), currentLang);
      doc.text(
        `${t("aiReport.generatedAt") || "Generated"}: ${generatedDate}`,
        margin,
        28,
      );

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(displayText, maxWidth);
      let y = 40;
      lines.forEach((line) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
      });

      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`AI_Report_${dateStr}.pdf`);
      toast.success(t("aiReport.downloadSuccess") || "Report downloaded");
    } catch (err) {
      console.error(err);
      toast.error(t("aiReport.downloadFailed") || "Download failed");
    }
  };

  return {
    displayText,
    paragraphs,
    hasReport,
    reportLang,
    isTranslating,
    isSpeaking,
    handleTranslate,
    handleSpeak,
    handleStopSpeak,
    handleDownloadReport,
  };
}

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiLiveMessagesQuery,
} from "@/features/dashboard/dashboardApiSlice";
import {
  LiveFeedHeader,
  LiveFeedColumn,
  LiveFeedSidebar,
} from "./components";

/**
 * AI Live Feed page: real-time activity feed with translation and sidebar stats.
 * Fetches messages from API, groups by date, and supports Original / Bangla / English.
 */
const AiLiveFeedPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetAiLiveMessagesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId, pollingInterval: 5000 },
  );

  const rawMessages = data?.messages ?? (Array.isArray(data) ? data : []);

  const formattedMessages = rawMessages.map((msg, idx) => {
    const isObj = typeof msg === "object" && msg !== null;
    const timestamp =
      isObj && msg.timestamp ? new Date(msg.timestamp) : new Date();
    const timeStr = timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateStr = timestamp
      .toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();

    return {
      id: idx,
      type: isObj ? msg.type : "info",
      user: isObj && msg.user ? msg.user : t("aiLiveFeed.aiAssistant"),
      action: isObj && msg.action ? msg.action : t("aiLiveFeed.generatedInsight"),
      target: isObj && msg.category ? `#${msg.category}` : null,
      time: timeStr,
      date: dateStr,
      content: isObj ? msg.text : String(msg),
      avatar: null,
    };
  });

  const groupedMessages = formattedMessages.reduce((groups, msg) => {
    const date = msg.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});



  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b0f14] font-sans">
      <div className="h-64 bg-gradient-to-b from-white to-[#F9FAFB] dark:from-[#1a1f26] dark:to-[#0b0f14] absolute top-0 left-0 right-0 pointer-events-none" />

      <div className="relative max-w-full mx-auto px-6 py-8">
        <LiveFeedHeader />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <LiveFeedColumn
            isLoading={isLoading}
            isError={isError}
            groupedMessages={groupedMessages}
            primaryColor="#887CFD"
          />
          <LiveFeedSidebar messageCount={formattedMessages.length} />
        </div>
      </div>
    </div>
  );
};

export default AiLiveFeedPage;

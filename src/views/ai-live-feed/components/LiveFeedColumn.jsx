import React from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Activity } from "lucide-react";
import TimelineItem from "./TimelineItem";

// -----------------------------------------------------------------------------
// LiveFeedColumn section: loading, error, empty, and timeline list by date
// Sub-components for each state to keep file ~150 lines per section.
// -----------------------------------------------------------------------------

/**
 * Loading state for the feed: spinner and message.
 * Shown while the feed is fetching from the API.
 */
const FeedLoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="w-8 h-8 border-2 border-[#887CFD] border-t-transparent rounded-full animate-spin" />
      <p>{t("aiLiveFeed.loadingFeed")}</p>
    </div>
  );
};

/**
 * Error state when the feed fails to load.
 * Shown when the API request returns an error.
 */
const FeedErrorState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-red-400 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800">
      <Activity className="w-8 h-8 opacity-50" />
      <p>{t("aiLiveFeed.loadFailed")}</p>
    </div>
  );
};

/**
 * Empty state when there are no messages yet.
 * Shown when the feed has loaded but the list is empty.
 */
const FeedEmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-20 bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <MessageSquare className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {t("aiLiveFeed.noActivityYet")}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        {t("aiLiveFeed.noActivityDesc")}
      </p>
    </div>
  );
};

/**
 * Sticky date label for a group of timeline items.
 * Shown above each date group in the feed.
 */
const DateGroupLabel = ({ date }) => (
  <div className="sticky top-4 z-20 mb-6">
    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 text-gray-500 shadow-sm uppercase tracking-wider backdrop-blur-md bg-opacity-80">
      {date}
    </span>
  </div>
);

/**
 * One date group: label + list of TimelineItems.
 * Used when rendering grouped messages by date.
 */
const DateGroup = ({ date, messages, primaryColor }) => (
  <div key={date} className="relative">
    <DateGroupLabel date={date} />
    <div className="space-y-2">
      {messages.map((msg, idx) => (
        <TimelineItem
          key={msg.id ?? idx}
          item={msg}
          isLast={idx === messages.length - 1}
        />
      ))}
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Main export: feed column with all states (loading, error, empty, list)
// -----------------------------------------------------------------------------

/**
 * Main feed column: loading, error, empty, or grouped timeline.
 * groupedMessages: { [date: string]: message[] }
 */
const LiveFeedColumn = ({
  isLoading,
  isError,
  groupedMessages,
  primaryColor = "#887CFD",
}) => {
  const hasMessages =
    groupedMessages && Object.keys(groupedMessages).length > 0;

  if (isLoading) {
    return (
      <div className="bg-transparent min-h-[500px]">
        <FeedLoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-transparent min-h-[500px]">
        <FeedErrorState />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-[500px]">
      <div className="space-y-8">
        {!hasMessages ? (
          <FeedEmptyState />
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <DateGroup
              key={date}
              date={date}
              messages={msgs}
              primaryColor={primaryColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// LiveFeedColumn expects: isLoading, isError, groupedMessages, primaryColor (optional).
// Section: LiveFeedColumn — loading, error, empty, timeline list (~150 lines).
// -----------------------------------------------------------------------------

export default LiveFeedColumn;

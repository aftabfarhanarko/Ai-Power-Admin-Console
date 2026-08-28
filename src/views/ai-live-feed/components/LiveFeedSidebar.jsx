import React from "react";
import { useTranslation } from "react-i18next";
import { Zap, User } from "lucide-react";

// -----------------------------------------------------------------------------
// LiveFeedSidebar section: feed stats (activity count, users) and note
// Sub-components for stat rows and card layout; ~150 lines per section.
// -----------------------------------------------------------------------------

/**
 * Single stat row: icon, label, value.
 * Used for activity count, users, and other feed metrics.
 */
const StatRow = ({ icon: Icon, iconColorClass, labelKey, value }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClass}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t(labelKey)}
        </span>
      </div>
      <span className="text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
};

/**
 * Activity count stat (messages / events in the feed).
 * Displays the total number of messages in the current feed.
 */
const ActivityStat = ({ count }) => (
  <StatRow
    icon={Zap}
    iconColorClass="bg-[#887CFD]/10 text-[#887CFD]"
    labelKey="aiLiveFeed.activity"
    value={count}
  />
);

/**
 * Users stat (e.g. "Active" or a numeric value).
 * Can show a translated label like "Active" or a count.
 */
const UsersStat = ({ value }) => (
  <StatRow
    icon={User}
    iconColorClass="bg-[#16C8C7]/10 text-[#16C8C7]"
    labelKey="aiLiveFeed.users"
    value={value}
  />
);

/**
 * Footer note in the sidebar (polling / update frequency info).
 * Renders a short description of how often the feed updates.
 */
const SidebarNote = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-400 leading-relaxed">
        {t("aiLiveFeed.feedUpdatesNote")}
      </p>
    </div>
  );
};

/**
 * Stats card container: title + list of stat rows + optional note.
 * Used for feed stats (activity count, users) with sticky positioning on lg.
 */
const StatsCard = ({ titleKey, children, note }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
        {t(titleKey)}
      </h3>
      <div className="space-y-4">{children}</div>
      {note}
    </div>
  );
};

/**
 * Wrapper for the sidebar column: hidden on small screens, visible on lg.
 * Contains the sticky stats card so the sidebar doesn't take space on mobile.
 */
const SidebarWrapper = ({ children }) => (
  <div className="hidden lg:block space-y-6">{children}</div>
);

/**
 * List of stat rows rendered inside the stats card.
 * Currently: Activity count and Users (Active).
 */
const StatsList = ({ messageCount }) => {
  const { t } = useTranslation();
  return (
    <>
      <ActivityStat count={messageCount} />
      <UsersStat value={t("aiLiveFeed.active")} />
    </>
  );
};

// -----------------------------------------------------------------------------
// Main export: sidebar with stats card and note
// -----------------------------------------------------------------------------

/**
 * Sidebar section for AI Live Feed.
 * Shows feed stats (activity count, users) and an optional note.
 * Sticky on large screens for better UX when scrolling the feed.
 * @param {number} messageCount - Number of messages in the feed (for activity stat)
 */
const LiveFeedSidebar = ({ messageCount = 0 }) => {
  return (
    <SidebarWrapper>
      <StatsCard
        titleKey="aiLiveFeed.feedStats"
        note={<SidebarNote />}
      >
        <StatsList messageCount={messageCount} />
      </StatsCard>
    </SidebarWrapper>
  );
};

// -----------------------------------------------------------------------------
// LiveFeedSidebar expects: messageCount (optional, default 0).
// Section: LiveFeedSidebar — feed stats and note (~150 lines).
// -----------------------------------------------------------------------------

export default LiveFeedSidebar;

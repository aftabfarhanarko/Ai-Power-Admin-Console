import React from "react";
import { motion } from "framer-motion";
import { User, ExternalLink } from "lucide-react";
import { getIconForType, getBgForType } from "./iconConfig";

// -----------------------------------------------------------------------------
// TimelineItem section: one feed entry (icon, meta, content)
// Each sub-component is kept in this file to stay within ~150 lines per section.
// -----------------------------------------------------------------------------

/**
 * Vertical connector line between timeline items.
 * Shown when this item is not the last in the group.
 */
const TimelineConnector = ({ visible }) =>
  visible ? (
    <div className="absolute left-[28px] top-12 bottom-0 w-[2px] bg-gradient-to-b from-gray-100 via-gray-200 to-transparent dark:from-gray-800 dark:via-gray-800/50" />
  ) : null;

/**
 * Icon circle with type-based gradient and hover animation.
 * Uses iconConfig for type -> icon and background class.
 */
const TimelineIcon = ({ type }) => {
  const IconComponent = getIconForType(type);
  const iconBg = getBgForType(type);
  return (
    <div className="relative z-10 flex-shrink-0">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none ring-4 ring-white dark:ring-[#0b0f14] ${iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

/**
 * Avatar or placeholder for the timeline item user.
 * Shows image when avatar URL is provided, otherwise a default user icon.
 */
const ItemAvatar = ({ avatar, user }) =>
  avatar ? (
    <img
      src={avatar}
      alt={user}
      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-800">
      <User className="w-5 h-5 text-gray-400" />
    </div>
  );

/**
 * User name, action, time, date, and optional target badge.
 * Renders inline with bullet separators.
 */
const ItemMeta = ({ user, action, time, date, target }) => (
  <div>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-bold text-gray-900 dark:text-white text-base hover:text-[#887CFD] transition-colors cursor-pointer">
        {user}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{action}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
      <span className="font-medium">{time}</span>
      <span>•</span>
      <span>{date}</span>
      {target && (
        <>
          <span>•</span>
          <span className="font-medium text-[#887CFD] bg-[#887CFD]/10 px-2 py-0.5 rounded-full">
            {target}
          </span>
        </>
      )}
    </div>
  </div>
);

/** Message content block (optional). Renders when item.content is present. */
const ItemContent = ({ content }) =>
  content ? (
    <div className="pl-[52px]">
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800/50 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {content}
      </div>
    </div>
  ) : null;

// -----------------------------------------------------------------------------
// Main export: single timeline entry with animation and type-based styling
// -----------------------------------------------------------------------------

/**
 * Single timeline entry for the AI Live Feed.
 * Renders icon, user info, timestamp, and optional content with animations.
 * @param {Object} item - { type, user, action, time, date, target?, content?, avatar? }
 * @param {boolean} isLast - Whether this is the last item in the group (hides connector).
 * @param {string} primaryColor - Theme color (e.g. #887CFD).
 */
const TimelineItem = ({ item, isLast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex gap-6 pb-12 last:pb-0 group"
    >
      <TimelineConnector visible={!isLast} />
      <TimelineIcon type={item.type} />

      <div className="flex-1 min-w-0 pt-1">
        <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <ItemAvatar avatar={item.avatar} user={item.user} />
              <ItemMeta
                user={item.user}
                action={item.action}
                time={item.time}
                date={item.date}
                target={item.target}
              />
            </div>
            <button className="text-gray-400 hover:text-[#887CFD] transition-colors p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <ItemContent content={item.content} />
        </div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// PropTypes / default props could be added here for item shape validation.
// item: { type, user, action, time, date, target?, content?, avatar? }
// Section: TimelineItem — one feed entry with icon, meta, content (~150 lines).
// -----------------------------------------------------------------------------

export default TimelineItem;

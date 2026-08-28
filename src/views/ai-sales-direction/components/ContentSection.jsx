import { motion } from "framer-motion";
import { CheckCircle2, Award } from "lucide-react";
import TimelineItem from "./TimelineItem";
import CircularStrategyMap from "./CircularStrategyMap";

// Content Section
const ContentSection = ({ directions, getDisplayDirection, t }) => {
  return (
    <div className="relative pb-16">
      {/* Timeline List - Visible on all devices */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {directions.map((dir, idx) => {
          const disp = getDisplayDirection(idx);
          const direction =
            typeof dir === "object" && dir !== null
              ? dir
              : {
                  title: t("aiSalesDirection.actionStep"),
                  action: String(dir),
                  priority: "medium",
                };

          return (
            <TimelineItem
              key={idx}
              direction={direction}
              index={idx}
              total={directions.length}
              displayTitle={disp?.title}
              displayAction={disp?.action}
              t={t}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ContentSection;

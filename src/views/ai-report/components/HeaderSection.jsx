import React from "react";
import { useTranslation } from "react-i18next";

const HeaderSection = ({ userName }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t("aiReport.hello", { name: userName || "SquadCart" })}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        {t("aiReport.dailyOverview")}
      </p>
    </div>
  );
};

export default HeaderSection;

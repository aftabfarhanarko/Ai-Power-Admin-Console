import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAreasQuery,
  useGetAreasByPostCodeQuery,
  useGetAreasByDistrictQuery,
} from "@/features/redx/redxApiSlice";
import { MapPin, Search, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Locations = () => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState("all");
  const [postCode, setPostCode] = useState("");
  const [districtName, setDistrictName] = useState("");

  const { data: areasData, isLoading: isLoadingAll } = useGetAreasQuery();
  const { data: areasByPostCode, isLoading: isLoadingPostCode } = useGetAreasByPostCodeQuery(postCode, {
    skip: searchType !== "postcode" || !postCode,
  });
  const { data: areasByDistrict, isLoading: isLoadingDistrict } = useGetAreasByDistrictQuery(districtName, {
    skip: searchType !== "district" || !districtName,
  });

  const areas =
    searchType === "postcode"
      ? areasByPostCode?.areas || []
      : searchType === "district"
      ? areasByDistrict?.areas || []
      : areasData?.areas || [];

  const isLoading = 
    (searchType === "all" && isLoadingAll) ||
    (searchType === "postcode" && isLoadingPostCode) ||
    (searchType === "district" && isLoadingDistrict);

  // Standardized Design Classes
  const cardClass = "bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider";
  const inputClass = "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 placeholder:text-gray-400";

  const tabs = [
    { id: "all", label: t("redx.allAreas") },
    { id: "postcode", label: t("redx.byPostCode") },
    { id: "district", label: t("redx.byDistrict") },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={titleClass}>{t("redx.browseAreas")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("redx.locationsDesc")}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchType(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                searchType === tab.id
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Inputs */}
        <AnimatePresence mode="wait">
          {searchType === "postcode" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 max-w-md"
            >
              <label className={labelClass}>{t("redx.postCode")}</label>
              <div className="relative">
                <input
                  type="text"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="e.g. 1209"
                  className={`${inputClass} pl-11`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </motion.div>
          )}

          {searchType === "district" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 max-w-md"
            >
              <label className={labelClass}>{t("redx.districtName")}</label>
              <div className="relative">
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder={t("redx.districtPlaceholder")}
                  className={`${inputClass} pl-11`}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {t("redx.areas")} 
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-xs text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-800">
                {areas.length}
              </span>
            </h4>
          </div>

          <div className="min-h-[200px] max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                 <Loader2 className="w-8 h-8 animate-spin mb-2" />
                 <p>{t("common.loading")}</p>
               </div>
            ) : areas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {searchType === "all"
                    ? t("redx.loadingAreas")
                    : t("redx.enterSearchCriteria")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.map((area) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={area.id}
                    className="group p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          {area.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {area.post_code}
                          </span>
                          <span>•</span>
                          <span>{area.division_name}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;

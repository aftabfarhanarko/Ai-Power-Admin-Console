import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import {
  MapPin,
  ChevronRight,
  Map,
  Navigation,
  Loader2,
  Building,
} from "lucide-react";

const Locations = () => {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: citiesData, isLoading: isLoadingCities } = useGetCitiesQuery();
  const { data: zonesData, isLoading: isLoadingZones } = useGetZonesQuery(
    selectedCity?.city_id,
    {
      skip: !selectedCity,
    },
  );
  const { data: areasData, isLoading: isLoadingAreas } = useGetAreasQuery(
    selectedZone?.zone_id,
    {
      skip: !selectedZone,
    },
  );

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-0 shadow-sm overflow-hidden flex flex-col h-[600px]";
  const headerClass = "p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1f26]";
  const contentClass = "flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2";

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Map className="w-6 h-6 text-violet-600" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t("pathao.browseLocations")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("pathao.locationsDesc") || "Browse cities, zones, and areas for delivery"}
                </p>
            </div>
        </div>

        {/* Breadcrumb / Selection Status */}
        {(selectedCity || selectedZone) && (
          <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-2 text-sm mb-6 shadow-sm">
              <span className="font-medium text-gray-500">Selected:</span>
              {selectedCity && (
                <span className="flex items-center gap-1 font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-1 rounded-lg">
                    <Building className="w-3.5 h-3.5" />
                    {selectedCity.city_name}
                </span>
              )}
              {selectedZone && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                        <Navigation className="w-3.5 h-3.5" />
                        {selectedZone.zone_name}
                    </span>
                </>
              )}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cities Column */}
            <div className={cardClass}>
                <div className={headerClass}>
                    <h3 className={titleClass}>
                        <Building className="w-5 h-5 text-blue-500" />
                        {t("pathao.cities")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 ml-7">{cities.length} available</p>
                </div>
                <div className={contentClass}>
                    {isLoadingCities ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-violet-500" /></div>
                    ) : (
                        <div className="space-y-1">
                            {cities.map((city) => (
                                <button
                                    key={city.city_id}
                                    onClick={() => {
                                        setSelectedCity(city);
                                        setSelectedZone(null);
                                    }}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                                        selectedCity?.city_id === city.city_id
                                        ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-800"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <span className="font-medium text-sm">{city.city_name}</span>
                                    {selectedCity?.city_id === city.city_id && <ChevronRight className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Zones Column */}
            <div className={cardClass}>
                <div className={headerClass}>
                    <h3 className={titleClass}>
                        <Navigation className="w-5 h-5 text-emerald-500" />
                        {t("pathao.zones")}
                    </h3>
                     <p className="text-xs text-gray-500 mt-1 ml-7">
                        {selectedCity ? `${zones.length} in ${selectedCity.city_name}` : "Select a city"}
                    </p>
                </div>
                <div className={contentClass}>
                    {!selectedCity ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
                            <Building className="w-12 h-12 mb-3" />
                            <p className="text-sm">Select a city to view zones</p>
                        </div>
                    ) : isLoadingZones ? (
                         <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>
                    ) : zones.length === 0 ? (
                         <div className="p-8 text-center text-gray-500 text-sm">No zones found</div>
                    ) : (
                        <div className="space-y-1">
                            {zones.map((zone) => (
                                <button
                                    key={zone.zone_id}
                                    onClick={() => setSelectedZone(zone)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                                        selectedZone?.zone_id === zone.zone_id
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <span className="font-medium text-sm">{zone.zone_name}</span>
                                    {selectedZone?.zone_id === zone.zone_id && <ChevronRight className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Areas Column */}
            <div className={cardClass}>
                <div className={headerClass}>
                    <h3 className={titleClass}>
                        <MapPin className="w-5 h-5 text-violet-500" />
                        {t("pathao.areas")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                        {selectedZone ? `${areas.length} in ${selectedZone.zone_name}` : "Select a zone"}
                    </p>
                </div>
                <div className={contentClass}>
                     {!selectedZone ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
                            <Navigation className="w-12 h-12 mb-3" />
                            <p className="text-sm">Select a zone to view areas</p>
                        </div>
                    ) : isLoadingAreas ? (
                         <div className="flex justify-center p-8"><Loader2 className="animate-spin text-violet-500" /></div>
                    ) : areas.length === 0 ? (
                         <div className="p-8 text-center text-gray-500 text-sm">No areas found</div>
                    ) : (
                        <div className="space-y-1">
                            {areas.map((area, index) => (
                                <div
                                    key={area.area_id}
                                    className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-3"
                                >
                                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{area.area_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <Building className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{cities.length}</p>
                    <p className="text-xs text-gray-500">Total Cities</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Navigation className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCity ? zones.length : "—"}</p>
                    <p className="text-xs text-gray-500">{selectedCity ? "Zones in City" : "Select City"}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-violet-600 dark:text-violet-400">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedZone ? areas.length : "—"}</p>
                    <p className="text-xs text-gray-500">{selectedZone ? "Areas in Zone" : "Select Zone"}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Locations;

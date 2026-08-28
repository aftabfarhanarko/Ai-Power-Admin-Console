import React from "react";
import { useTranslation } from "react-i18next";
import { useGetPoliceStationsQuery } from "@/features/steadfast/steadfastApiSlice";
import ReusableTable from "@/components/table/reusable-table";
import { Building2 } from "lucide-react";

const PoliceStations = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPoliceStationsQuery();
  const policeStations = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.police_stations)
        ? data.police_stations
        : [];

  // Determine headers based on data structure
  const getHeaders = () => {
    if (policeStations.length === 0) {
      return [
        { header: t("steadfast.name", "Name"), field: "name" },
        { header: t("steadfast.address", "Address"), field: "address" },
        { header: t("steadfast.phone", "Phone"), field: "phone" },
      ];
    }

    const firstItem = policeStations[0];
    if (!firstItem || typeof firstItem !== "object") {
      return [
        { header: t("steadfast.name", "Name"), field: "name" },
        { header: t("steadfast.address", "Address"), field: "address" },
        { header: t("steadfast.phone", "Phone"), field: "phone" },
      ];
    }
    return Object.keys(firstItem).map((key) => ({
      header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      field: key,
    }));
  };

  const headers = getHeaders();

  const toRenderableValue = (value) => {
    if (value == null || value === "") return "-";
    if (typeof value === "object") {
      return Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
    }
    return String(value);
  };

  const tableData = Array.isArray(policeStations)
    ? policeStations.map((station, index) => {
        const row = { id: index + 1 };
        headers.forEach((header) => {
          row[header.field] = toRenderableValue(station[header.field]);
        });
        return row;
      })
    : [];

  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-500" />
          {t("steadfast.policeStationsTitle", "Police Stations")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("steadfast.policeStationsDesc", "View available police stations for delivery")}
        </p>
      </div>

      <div className={cardClass}>
        <ReusableTable
          data={tableData}
          headers={headers}
          total={policeStations.length}
          isLoading={isLoading}
          py="py-3"
        />
      </div>
    </div>
  );
};

export default PoliceStations;

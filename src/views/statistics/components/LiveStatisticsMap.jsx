import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Wifi, Truck, Box, Star, Users } from "lucide-react";

/**
 * LiveStatisticsMap Component
 * Displays an interactive map visualization with coverage statistics from cover.json
 */
export default function LiveStatisticsMap() {
  const { t } = useTranslation();
  const [coverageData, setCoverageData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch coverage data
  useEffect(() => {
    fetch("/cover.json")
      .then((res) => res.json())
      .then((data) => {
        setCoverageData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load coverage data:", err);
        setLoading(false);
      });
  }, []);

  // Calculate totals for sidebar
  const stats = useMemo(() => {
    const totalDeliveries = coverageData.reduce((acc, curr) => acc + (curr.total_deliveries || 0), 0);
    const totalActiveVehicles = coverageData.reduce((acc, curr) => acc + (curr.active_vehicles || 0), 0);
    
    // Sort cities by active vehicles for the list
    const topCities = [...coverageData]
      .sort((a, b) => b.active_vehicles - a.active_vehicles)
      .slice(0, 5);

    return { totalDeliveries, totalActiveVehicles, topCities };
  }, [coverageData]);

  // Custom formatting
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-6 lg:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Map Area */}
      <div className="lg:col-span-2 relative min-h-[400px] h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800 z-0">
        <h2 className="absolute top-4 left-4 lg:top-6 lg:left-6 text-xl font-bold z-[400] text-gray-900 bg-white/80 dark:bg-black/50 dark:text-white px-4 py-2 rounded-xl backdrop-blur-md shadow-sm border border-white/20">
          {t("statistics.liveStatistics") || "Live Coverage"}
        </h2>

        {/* Connection Status Indicator */}
        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2 bg-white/90 dark:bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">System Online</span>
        </div>

        {!loading && (
          <MapContainer
            center={[23.8103, 90.4125]} // Default center (Dhaka)
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full z-0"
            style={{ background: "#F8F9FB" }}
          >
            {/* Light Mode Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Dark Mode Overlay (CSS filter trick for dark mode) */}
            {/* Note: In a real app, you might swap the TileLayer url based on theme context */}

            {coverageData
              .filter(location => location.latitude && location.longitude)
              .map((location) => (
              <CircleMarker
                key={location.id}
                center={[location.latitude, location.longitude]}
                pathOptions={{
                  color: "#8B5CF6",
                  fillColor: "#8B5CF6",
                  fillOpacity: 0.6,
                }}
                radius={Math.log(location.active_vehicles || 1) * 3 + 5} // Dynamic size
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{location.city}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Vehicles</span>
                        <span className="font-semibold text-violet-600">{location.active_vehicles}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Box className="w-3 h-3" /> Orders</span>
                        <span className="font-semibold text-violet-600">{location.pending_orders}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Rating</span>
                        <span className="font-semibold text-amber-500">{location.rating}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <span className="font-bold">{location.city}</span>: {location.active_vehicles} Active
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats List Area */}
      <div className="flex flex-col h-full lg:pl-2">
        {/* Total Stats Header */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right"
          >
            <span className="block text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatNumber(stats.totalActiveVehicles)}
            </span>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center justify-end gap-2">
              <Truck className="w-4 h-4 text-violet-500" />
              Total Active Vehicles
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-right mt-4"
          >
            <span className="block text-2xl font-bold text-gray-700 dark:text-gray-300">
              {formatNumber(stats.totalDeliveries)}
            </span>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center justify-end gap-2">
              <Box className="w-3 h-3 text-emerald-500" />
              Total Deliveries
            </p>
          </motion.div>
        </div>

        {/* Top Cities List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">
            Top Performing Cities
          </h3>
          <div className="space-y-3">
            {stats.topCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-violet-100 dark:hover:border-violet-900 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                    index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    index === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                    index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                      {city.city}
                    </h4>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> {city.rating} Rating
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">
                    {city.active_vehicles}
                  </span>
                  <span className="text-[10px] text-gray-400">Vehicles</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
           <p className="text-[10px] text-center text-gray-400">
             Live data updated every 5 mins
           </p>
        </div>
      </div>
    </motion.div>
  );
}

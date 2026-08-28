import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  ShoppingBag, 
  HardDrive, 
  Package, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Mail,
  MessageCircle,
  Zap
} from "lucide-react";

const ADDON_DATA = [
  {
    type: "VISITORS",
    title: "Extra Visitors",
    price: 5,
    value: 5000,
    unit: "Visitors",
    desc: "Scale your traffic limit without upgrading your entire plan.",
    icon: Users,
    color: "blue",
  },
  {
    type: "ORDERS",
    title: "Order Booster",
    price: 10,
    value: 100,
    unit: "Orders",
    desc: "Process more orders during peak seasons seamlessly.",
    icon: ShoppingBag,
    color: "emerald",
  },
  {
    type: "PRODUCTS",
    title: "Product Limit",
    price: 10,
    value: 500,
    unit: "Products",
    desc: "Expand your catalog capacity instantly.",
    icon: Package,
    color: "violet",
  },
  {
    type: "STORAGE",
    title: "Storage Expansion",
    price: 15,
    value: 10,
    unit: "GB",
    desc: "Store more product images and digital assets securely.",
    icon: HardDrive,
    color: "amber",
  },
  {
    type: "STAFF",
    title: "Additional Staff",
    price: 5,
    value: 1,
    unit: "Seat",
    desc: "Give access to more team members with granular permissions.",
    icon: UserPlus,
    color: "rose",
  },
  {
    type: "EMAIL",
    title: "Extra Email",
    price: 5,
    value: 1,
    unit: "Month",
    desc: "Professional branded email addresses for your business.",
    icon: Mail,
    color: "sky",
  },
  {
    type: "CHAT",
    title: "Chat Widgets",
    price: 10,
    value: 1,
    unit: "Setup",
    desc: "Integrate Messenger or WhatsApp Chat directly on your site.",
    icon: MessageCircle,
    color: "indigo",
  },
  {
    type: "PRIORITY_SUPPORT",
    title: "Priority Support",
    price: 20,
    value: 1,
    unit: "Month",
    desc: "Skip the queue with 24/7 direct access to senior engineers.",
    icon: Zap,
    color: "orange",
  },
];

export const AddonSection = ({ onPurchase, isCreatingInvoice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, ADDON_DATA.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative mb-12 group/slider">
      {/* Navigation Buttons */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
        <button
          onClick={nextSlide}
          disabled={currentIndex === maxIndex}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Items Container */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: `calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * (24 / itemsPerPage)}px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {ADDON_DATA.map((addon) => {
            const Icon = addon.icon;
            return (
              <div 
                key={addon.type}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all group h-full flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${addon.color}-50 dark:bg-${addon.color}-500/10 text-${addon.color}-600 dark:text-${addon.color}-400 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {addon.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">$ {addon.price}</span>
                    <span className="text-slate-500 text-sm">/ {addon.value} {addon.unit}</span>
                  </div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">
                    {addon.desc}
                  </p>
                  
                  <button
                    onClick={() => onPurchase(addon)}
                    disabled={isCreatingInvoice}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-auto"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Purchase Add-on
                  </button>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === i 
                ? "w-6 bg-violet-600" 
                : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { 
  RefreshCw, 
  ChevronRight, 
  Smartphone, 
  CreditCard,
  Zap,
  Tag,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Reusable Banner Components
 */

/**
 * OfferBanner Component
 * Large promotional banner with 3D icons and gradients.
 */
const OfferBanner = ({ title, subtitle, discount, bgColor, icon: Icon, children }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-[32px] p-10 h-full min-h-[340px] flex flex-col justify-center text-white shadow-2xl ${bgColor} group cursor-pointer`}
  >
    <div className="relative z-10 max-w-[200px] space-y-4">
      <h2 className="text-4xl font-black leading-tight tracking-tight">
        {title} <span className="block text-white/80">{discount}</span>
      </h2>
      <p className="text-sm font-bold text-white/70 uppercase tracking-widest">{subtitle}</p>
    </div>
    
    {/* Floating 3D Elements Placeholder Logic */}
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center">
       {children}
    </div>

    {/* Background Decorative Blur */}
    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
  </motion.div>
);

/**
 * ProductBanner Component
 * Card-style banner focusing on a specific item (e.g., iPhone).
 */
const ProductBanner = ({ name, description, priceRange, children }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-[#1a1f26]/40 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-gray-200/20 dark:shadow-none h-full flex flex-col items-center text-center group"
  >
    <div className="w-full h-48 mb-8 relative flex items-center justify-center">
       {children}
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-black text-[#0b121e] dark:text-white">{name}</h3>
      <p className="text-[13px] text-gray-400 font-bold leading-relaxed">{priceRange}</p>
      <button className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest pt-2 flex items-center gap-1 mx-auto hover:gap-2 transition-all">
        Shop now <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </motion.div>
);

/**
 * BalanceCard Component
 * Metric-focused vertical or horizontal card.
 */
const BalanceCard = ({ title, amount, subtitle, color, icon: Icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`${color} rounded-[32px] p-8 text-white flex flex-col justify-between h-full min-h-[340px] relative overflow-hidden group`}
  >
     <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm self-start">
        <Icon className="w-5 h-5" />
     </div>
     <div className="space-y-2 relative z-10">
        <span className="text-4xl font-black tracking-tighter">${amount}</span>
        <p className="text-[10px] uppercase font-black text-white/60 tracking-widest">{title}</p>
     </div>
     {/* Credit Card Graphic Placeholder */}
     <div className="mt-8 relative h-32 w-full">
        <div className="absolute right-0 bottom-0 w-48 h-32 bg-white/10 rounded-2xl border border-white/20 rotate-12 group-hover:rotate-6 transition-transform origin-bottom-right" />
        <div className="absolute right-4 bottom-4 w-48 h-32 bg-white/20 rounded-2xl border border-white/20 -rotate-6 group-hover:rotate-0 transition-transform origin-bottom-right" />
     </div>
  </motion.div>
);

/**
 * Main BannersOffersPage
 */
export default function BannersOffersPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 lg:p-10 bg-white dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <h1 className="text-4xl font-extrabold text-[#0b121e] dark:text-white tracking-tight">Banners & Offers</h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#0b121e]/60 dark:text-white/40">
            <span>Data Refreshed</span>
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
          </div>
          <div className="bg-gray-50 dark:bg-white/5 py-3 px-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-bold text-[#0b121e] dark:text-white">
             {format(new Date(), "MMMM dd, yyyy hh:mm a")}
          </div>
        </div>
      </div>

      {/* --- MASONRY GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
        
        {/* Row 1, Col 1-2: Large Offer */}
        <div className="md:col-span-2 lg:col-span-2">
           <OfferBanner 
             title="Get Up to" 
             discount="70% off" 
             subtitle="subscribe" 
             bgColor="bg-gradient-to-br from-[#1a2b4b] to-[#0a1120]"
           >
              <div className="relative w-full h-full">
                 {/* Visual Mock: 3D Guy with Phone */}
                 <div className="absolute -bottom-10 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                 <Smartphone className="absolute top-1/2 right-10 -translate-y-1/2 w-32 h-32 text-blue-500/30 rotate-12" />
                 <div className="absolute top-1/2 right-4 w-12 h-12 bg-emerald-500 rounded-full border-4 border-[#0a1120] flex items-center justify-center shadow-xl">
                    <Zap className="w-5 h-5 text-white" />
                 </div>
              </div>
           </OfferBanner>
        </div>

        {/* Row 1, Col 3-4: Balance Info */}
        <div className="md:col-span-2 lg:col-span-2">
           <motion.div 
             whileHover={{ scale: 1.01 }}
             className="bg-white dark:bg-[#1a1f26]/40 rounded-[32px] border border-gray-100 dark:border-gray-800 p-10 h-full flex items-center justify-between shadow-xl shadow-gray-200/20 dark:shadow-none group"
           >
              <div className="space-y-4">
                 <div className="flex -space-x-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800" />
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 border border-white dark:border-gray-700 shadow-lg" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-4xl font-black text-[#0b121e] dark:text-white">$476,3k</span>
                    <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Total Balance</p>
                 </div>
              </div>
              <div className="w-1/3 relative">
                 <div className="w-full aspect-square bg-blue-600/5 rounded-full flex items-center justify-center">
                    <TrendingUpIcon />
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Row 1, Col 5: Transactions Mini Card */}
        <div className="md:col-span-1 lg:col-span-1">
           <BalanceCard 
              title="Transactions" 
              amount="32,987" 
              color="bg-gradient-to-br from-[#0bd79c] to-[#04a074]" 
              icon={CreditCard}
           />
        </div>

        {/* Row 1, Col 6: Worldwide Promo (Vertical) */}
        <div className="md:col-span-1 lg:col-span-1 row-span-2">
           <motion.div className="bg-white dark:bg-[#1a1f26]/40 rounded-[40px] border border-gray-100 dark:border-gray-800 h-full overflow-hidden flex flex-col items-center p-8 text-center shadow-xl shadow-gray-200/20 dark:shadow-none">
              <div className="relative w-full aspect-square mb-10 flex items-center justify-center">
                 <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl" />
                 <WorldIcon />
              </div>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                 <h4 className="text-2xl font-extrabold text-[#0b121e] dark:text-white leading-tight">Worldwide Transactions</h4>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-4">100% Open Source - No sign up required</p>
                 <Button className="w-full bg-[#0ac9a3] hover:bg-[#09b692] text-white rounded-2xl h-14 font-black shadow-lg shadow-teal-500/20">
                    Try for Free
                 </Button>
              </div>
           </motion.div>
        </div>

        {/* Row 2, Col 1-2: Phone Promo */}
        <div className="md:col-span-2 lg:col-span-2">
           <ProductBanner name="New Phone15 Pro" priceRange="Get $200–$600 in credit toward">
              <div className="relative w-full h-full">
                 <Smartphone className="w-32 h-32 text-gray-400/20 rotate-[-15deg] absolute left-1/2 -translate-x-full top-0" />
                 <Smartphone className="w-40 h-40 text-blue-500/40 rotate-[10deg] absolute left-1/2 -translate-x-1/4 top-0 z-10" />
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-600 rounded-full blur-[60px]" />
              </div>
           </ProductBanner>
        </div>

        {/* Row 2, Col 3-4: Hot Offer */}
        <div className="md:col-span-2 lg:col-span-2">
           <motion.div className="bg-[#ffdb00] rounded-[32px] p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group border-[4px] border-dashed border-red-500/20">
              <div className="space-y-6 relative z-10">
                 <MegaphoneIcon />
                 <h3 className="text-4xl font-black text-[#0b121e] italic uppercase tracking-tighter">Hot Offer!</h3>
                 <Button className="bg-white text-rose-500 hover:bg-gray-50 rounded-2xl h-14 px-10 font-black shadow-xl shadow-gray-200/50 flex items-center gap-2">
                    Get Discount <Tag className="w-4 h-4" />
                 </Button>
              </div>
              <div className="absolute top-4 left-4 w-6 h-6 border-2 border-[#0b121e]/10 rounded-full" />
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#0b121e]/5 rounded-full" />
           </motion.div>
        </div>

        {/* Row 2, Col 5: Security Promo */}
        <div className="md:col-span-2 lg:col-span-1">
           <OfferBanner 
             title="Security" 
             discount="Payments" 
             subtitle="Secure e-commerce platform and payment provider" 
             bgColor="bg-gradient-to-br from-[#0c1f43] to-[#04101a]"
           >
              <div className="relative w-48 h-48 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                 <CreditCard className="w-16 h-16 text-blue-500/40" />
                 <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-full" />
              </div>
           </OfferBanner>
        </div>

      </div>

      {/* --- BOTTOM ROW CARDS --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-5 bg-gradient-to-r from-[#031d60] to-[#0066ff] rounded-[24px] p-8 flex items-center justify-between text-white shadow-xl">
            <div className="space-y-1">
               <h5 className="font-black text-sm">Make your new become a part of</h5>
               <p className="text-[11px] font-bold text-white/60">largest marketplace</p>
            </div>
            <Button className="bg-[#0ac9a3] hover:bg-[#09b692] rounded-2xl h-12 px-8 font-black">Subscribe</Button>
         </div>
         
         <div className="lg:col-span-4 bg-white dark:bg-[#1a1f26]/40 border-[2px] border-blue-600 rounded-[24px] p-8 flex items-center justify-center relative overflow-hidden group">
            <h5 className="font-black text-blue-600 text-lg flex items-center gap-3">
               Best offers for subscribers
               <Gift className="w-6 h-6 animate-bounce" />
            </h5>
            <div className="absolute right-0 top-0 h-full w-12 bg-blue-600 flex items-center justify-center">
               <ChevronRight className="text-white w-6 h-6" />
            </div>
         </div>

         <div className="lg:col-span-3 bg-[#ffdb00] rounded-[24px] border-[3px] border-dashed border-red-500/20 p-8 flex items-center gap-6 shadow-lg">
            <div className="bg-[#0b121e] p-3 rounded-xl rotate-[-10deg]">
               <Smartphone className="w-5 h-5 text-white" />
            </div>
            <h5 className="text-2xl font-black text-[#0b121e] italic uppercase italic">Hot Offer!</h5>
         </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
         <span>SquadCart Promo Engine v2.0</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-[#0066ff]">Kanakku Creative Hub</span>
         </div>
      </footer>
    </div>
  );
}

/**
 * Custom SVG Icons for Mockup Accuracy
 */
const TrendingUpIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 fill-blue-600/20" xmlns="http://www.w3.org/2000/svg">
     <path d="M20 70 L40 50 L60 60 L80 30" fill="none" stroke="#0066ff" strokeWidth="6" strokeLinecap="round" />
     <path d="M75 30 L80 30 L80 35" fill="none" stroke="#0066ff" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const WorldIcon = () => (
  <svg viewBox="0 0 200 200" className="w-40 h-40" xmlns="http://www.w3.org/2000/svg">
     <circle cx="100" cy="100" r="80" fill="#0066ff" fillOpacity="0.1" />
     <circle cx="100" cy="100" r="60" fill="url(#worldGrad)" />
     <defs>
        <linearGradient id="worldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" style={{stopColor:'#0ac9a3', stopOpacity:1}} />
           <stop offset="100%" style={{stopColor:'#0066ff', stopOpacity:1}} />
        </linearGradient>
     </defs>
     <path d="M100 40 Q130 100 100 160 M100 40 Q70 100 100 160" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
     <circle cx="130" cy="70" r="4" fill="white" />
     <circle cx="80" cy="120" r="6" fill="#ffdb00" />
  </svg>
);

const MegaphoneIcon = () => (
   <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
      <div className="w-20 h-20 bg-[#0b121e] rounded-full flex items-center justify-center rotate-[-15deg] shadow-2xl">
         <Smartphone className="w-10 h-10 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border-2 border-red-500 flex items-center justify-center">
         <span className="text-red-500 font-black text-xs">%</span>
      </div>
   </div>
);

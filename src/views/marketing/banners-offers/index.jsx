import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { 
  RefreshCw, 
  ChevronRight, 
  Smartphone, 
  CreditCard,
  Zap,
  Tag,
  Gift,
  Search,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Percent,
  Copy,
  Check,
  Eye,
  Filter,
  ArrowUpRight,
  Flame,
  Clock,
  SlidersHorizontal,
  Bookmark,
  Share2,
  X,
  Star,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

/**
 * Reusable Ultra-Premium Market Components
 */

/**
 * OfferBanner Component
 * Large promotional banner with glassmorphism glow and floating elements.
 */
const OfferBanner = ({ title, subtitle, discount, bgColor, icon: Icon, onClaim, children }) => (
  <motion.div 
    whileHover={{ y: -6, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`relative overflow-hidden rounded-[32px] p-8 lg:p-10 h-full min-h-[360px] flex flex-col justify-between text-white shadow-2xl ${bgColor} group cursor-pointer border border-white/10 dark:border-white/5 backdrop-blur-xl`}
  >
    {/* Ambient Glow Effects */}
    <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

    <div className="relative z-10 space-y-4 max-w-xs">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white/90">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Featured Marketplace Deal</span>
      </div>

      <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight drop-shadow-md">
        {title} <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-white">{discount}</span>
      </h2>

      <p className="text-xs font-semibold text-white/80 leading-relaxed max-w-xs">{subtitle}</p>
    </div>

    {/* Floating Visual Element Area */}
    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center pointer-events-none">
       {children}
    </div>

    {/* Footer CTA Button */}
    <div className="relative z-10 pt-6 flex items-center gap-3">
      <Button 
        onClick={onClaim}
        className="bg-white text-slate-950 hover:bg-amber-300 hover:text-slate-950 font-black rounded-2xl h-12 px-7 text-xs uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group/btn"
      >
        Claim Offer Now
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </Button>
    </div>
  </motion.div>
);

/**
 * ProductBanner Component
 * Card-style product feature banner with glass frame and interactive quick preview.
 */
const ProductBanner = ({ name, description, priceRange, tag = "HOT DEAL", onPreview, children }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-white dark:bg-[#121824]/80 backdrop-blur-xl rounded-[32px] border border-gray-200/80 dark:border-gray-800/80 p-8 shadow-2xl shadow-slate-900/5 dark:shadow-none h-full flex flex-col justify-between group relative overflow-hidden"
  >
    {/* Subtle Card Accent Light */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          {tag}
        </span>
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>4.9</span>
        </div>
      </div>

      <div className="w-full h-44 mb-6 relative flex items-center justify-center">
         {children}
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{name}</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{priceRange}</p>
      </div>
    </div>

    <div className="pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-6 flex items-center justify-between">
      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Vendor
      </span>
      <button 
        onClick={onPreview}
        className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all hover:underline"
      >
        View Details <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

/**
 * MetricCard Component
 */
const MetricCard = ({ title, amount, change, isPositive, icon: Icon, color, bg }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-[#121824]/80 backdrop-blur-xl rounded-[28px] border border-gray-200/70 dark:border-gray-800/70 p-6 shadow-xl shadow-slate-900/5 dark:shadow-none flex items-center justify-between group"
  >
    <div className="space-y-2">
      <p className="text-[11px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{amount}</h4>
        {change && (
          <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>

    <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-6 h-6" />
    </div>
  </motion.div>
);

/**
 * Main BannersOffersPage
 */
export default function BannersOffersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const categories = [
    { id: "all", label: "All Marketplace", icon: LayoutGrid },
    { id: "featured", label: "Featured Deals", icon: Sparkles },
    { id: "hot", label: "Hot Flash Sales", icon: Flame },
    { id: "promos", label: "Discount Promos", icon: Tag },
    { id: "hardware", label: "Tech & Hardware", icon: Smartphone },
    { id: "security", label: "Enterprise Security", icon: ShieldCheck },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Syncing marketplace feeds...',
        success: 'Marketplace feeds updated!',
        error: 'Could not refresh market data.',
      }
    ).finally(() => setIsRefreshing(false));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`Promo Code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimDeal = (title) => {
    toast.success(`Claim request submitted for "${title}"!`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-slate-50/60 dark:bg-[#080b10] min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* --- HEADER BAR & AMBIENT GLOW --- */}
      <div className="relative mb-10">
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Merchant Hub</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Marketing Marketplace</h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Discover exclusive marketing campaigns, partner offers, high-converting banner themes, and promotional tools.
            </p>
          </div>

          {/* Action & Sync Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-64 xl:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, offers, codes..."
                className="w-full h-11 pl-10 pr-4 text-xs font-bold rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="h-11 px-4 rounded-2xl bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Market</span>
            </Button>

            <div className="h-11 px-4 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{format(new Date(), "MMM dd, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-lg shadow-blue-500/20 scale-105" 
                    : "bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- METRICS ANALYTICS DASHBOARD --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <MetricCard 
          title="Total Market Volume" 
          amount="$476,300" 
          change="+24.8%" 
          isPositive={true}
          icon={TrendingUp}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard 
          title="Active Transactions" 
          amount="32,987" 
          change="+12.4%" 
          isPositive={true}
          icon={CreditCard}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard 
          title="Global Markets Active" 
          amount="12 Hubs" 
          change="99.9% Uptime" 
          isPositive={true}
          icon={Globe}
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-50 dark:bg-purple-500/10"
        />
        <MetricCard 
          title="Conversion Growth" 
          amount="84.2%" 
          change="+8.5%" 
          isPositive={true}
          icon={Zap}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* --- FEATURED MASONRY MARKET GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 sm:gap-8">
        
        {/* Main Large Offer Banner (Spans 2 cols) */}
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
           <OfferBanner 
             title="Unlimited Access Pass" 
             discount="70% Off Annual" 
             subtitle="Supercharge your store growth with premium banner themes, AI recommendations, and priority courier dispatch." 
             bgColor="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16]"
             onClaim={() => handleClaimDeal("70% Off Annual Subscribe")}
           >
              <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl" />
                 <Smartphone className="w-36 h-36 text-indigo-400/30 rotate-12 drop-shadow-2xl" />
                 <div className="absolute top-1/3 right-6 w-14 h-14 bg-emerald-500 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-2xl rotate-[-12deg]">
                    <Zap className="w-7 h-7 text-white" />
                 </div>
              </div>
           </OfferBanner>
        </div>

        {/* Hot Flash Code Card (Spans 2 cols) */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-3">
           <motion.div 
             whileHover={{ y: -5 }}
             className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-[32px] p-8 h-full min-h-[360px] flex flex-col justify-between text-slate-950 relative overflow-hidden group shadow-2xl shadow-amber-500/20 border border-amber-300/40"
           >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-300" /> Flash Sale
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 23h 42m Left
                  </span>
                </div>

                <h3 className="text-3xl font-black italic uppercase tracking-tight">Super Booster Code</h3>
                <p className="text-xs font-extrabold text-slate-900/80">Get flat $100 cashback on all logistics and banner placement tools.</p>
              </div>

              {/* Promo Code Box */}
              <div className="relative z-10 space-y-4 pt-6">
                <div className="bg-slate-950/90 text-white rounded-2xl p-4 flex items-center justify-between border border-white/10 shadow-lg">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Coupon Code</span>
                    <p className="text-lg font-black tracking-widest text-amber-400">SQUAD70PRO</p>
                  </div>
                  <Button 
                    onClick={() => handleCopyCode("SQUAD70PRO")}
                    className="bg-amber-400 text-slate-950 hover:bg-white font-black rounded-xl h-10 px-4 text-xs"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
           </motion.div>
        </div>

        {/* Product Card 1 (iPhone / Hardware) */}
        <div className="md:col-span-1 lg:col-span-1 xl:col-span-2">
           <ProductBanner 
             name="iPhone 15 Pro Hardware Sync" 
             priceRange="Earn up to $600 trade-in credits on store setup"
             tag="HARDWARE BUNDLE"
             onPreview={() => setSelectedDeal({
               name: "iPhone 15 Pro Hardware Sync",
               priceRange: "Earn up to $600 trade-in credits",
               description: "Full store integration kit with high-speed POS hardware, mobile card reader, and thermal receipt printer.",
               code: "HARDWARE2026",
               rating: "4.9 / 5.0"
             })}
           >
              <div className="relative w-full h-full flex items-center justify-center">
                 <Smartphone className="w-24 h-24 text-slate-300 dark:text-slate-700 rotate-[-15deg] absolute -left-2" />
                 <Smartphone className="w-32 h-32 text-blue-600 dark:text-blue-400 rotate-[10deg] absolute z-10 drop-shadow-xl" />
                 <div className="absolute bottom-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
              </div>
           </ProductBanner>
        </div>

        {/* Enterprise Security Card */}
        <div className="md:col-span-1 lg:col-span-1 xl:col-span-2">
           <OfferBanner 
             title="Bank-Grade Security" 
             discount="100% Guaranteed" 
             subtitle="Compliant payment gateway integrations with automated fraud protection." 
             bgColor="bg-gradient-to-br from-[#09152b] to-[#040912]"
             onClaim={() => handleClaimDeal("Bank-Grade Security Shield")}
           >
              <div className="relative w-36 h-36 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center">
                 <ShieldCheck className="w-16 h-16 text-blue-400 drop-shadow-lg" />
                 <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping pointer-events-none" />
              </div>
           </OfferBanner>
        </div>

        {/* Global Transactions Card */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
           <motion.div 
             whileHover={{ y: -5 }}
             className="bg-white dark:bg-[#121824]/80 backdrop-blur-xl rounded-[32px] border border-gray-200/80 dark:border-gray-800/80 p-8 shadow-2xl shadow-slate-900/5 dark:shadow-none h-full flex flex-col justify-between"
           >
              <div className="space-y-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white">Worldwide Dispatch</h4>
                 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                   Connect with Steadfast, Pathao, and RedX logistics networks seamlessly.
                 </p>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => handleClaimDeal("Worldwide Dispatch Logistics Integration")}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Enable Logistics Hub
                </Button>
              </div>
           </motion.div>
        </div>

      </div>

      {/* --- BOTTOM PROMO BANNER BAR --- */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
         <div className="lg:col-span-7 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-[28px] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-2xl gap-6 border border-white/10">
            <div className="space-y-2">
               <span className="px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-widest text-amber-300">
                 Partner Program
               </span>
               <h3 className="text-2xl font-black tracking-tight">Become an Official SquadCart Marketplace Seller</h3>
               <p className="text-xs font-semibold text-white/80">List your custom themes, banners, and automation scripts for thousands of merchants.</p>
            </div>
            <Button 
              onClick={() => handleClaimDeal("Partner Program Application")}
              className="bg-white text-blue-900 hover:bg-amber-300 hover:text-slate-950 rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shrink-0 shadow-lg"
            >
               Apply Now
            </Button>
         </div>

         <div className="lg:col-span-5 bg-white dark:bg-[#121824]/80 backdrop-blur-xl border border-blue-500/30 dark:border-blue-500/20 rounded-[28px] p-8 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Subscriber Perks</span>
               <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Best offers for Pro Plan
                  <Gift className="w-5 h-5 text-rose-500 animate-bounce" />
               </h4>
            </div>
            <Button 
              onClick={() => handleClaimDeal("VIP Perks Unlocked")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
            >
              Explore Perks
            </Button>
         </div>
      </div>

      {/* --- DETAIL PREVIEW MODAL --- */}
      <AnimatePresence>
        {selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setSelectedDeal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  Verified Offer
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedDeal.name}</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedDeal.description}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Value Proposition:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{selectedDeal.priceRange}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Merchant Rating:</span>
                  <span className="text-amber-500">{selectedDeal.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={() => {
                    handleClaimDeal(selectedDeal.name);
                    setSelectedDeal(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-12 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25"
                >
                  Claim Deal Now
                </Button>
                <Button 
                  onClick={() => handleCopyCode(selectedDeal.code)}
                  variant="outline"
                  className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FOOTER --- */}
      <footer className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
         <span>SquadCart Marketing Engine v3.0</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-blue-600 dark:text-blue-400 font-black">SquadCart Enterprise Core</span>
         </div>
      </footer>
    </div>
  );
}


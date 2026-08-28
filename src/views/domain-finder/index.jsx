import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Sparkles,
  Globe,
  Check,
  Loader2,
  Star,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DomainFinderPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);

  const tlds = [
    { name: ".com", price: "$19.99", sale: "$0.01" },
    { name: ".online", price: "$35.99", sale: "$0.99" },
    { name: ".shop", price: "$34.99", sale: "$0.99" },
    { name: ".pro", price: "$20.99", sale: "$2.99" },
    { name: ".net", price: "$17.99", sale: "$11.99", gift: true },
    { name: ".blog", price: "$29.99", sale: "$1.99" },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(false);

    // Simulate API search delay
    setTimeout(() => {
      const baseName = searchQuery
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .split(".")[0];

      const generatedResults = [
        { tld: ".com", price: 12.99, originalPrice: 19.99, popular: true },
        { tld: ".io", price: 39.99, originalPrice: 59.99, popular: true },
        { tld: ".store", price: 2.99, originalPrice: 29.99, sale: true },
        { tld: ".net", price: 14.99, originalPrice: 18.99 },
        { tld: ".org", price: 15.99, originalPrice: 19.99 },
        { tld: ".ai", price: 69.99, originalPrice: 89.99, trending: true },
        { tld: ".shop", price: 1.99, originalPrice: 34.99, sale: true },
        { tld: ".co", price: 24.99, originalPrice: 32.99 },
      ].map((ext) => ({
        domain: `${baseName}${ext.tld}`,
        ...ext,
        available: Math.random() > 0.3, // ~70% chance available
      }));

      // Force .com to be taken for well-known names
      if (["google", "test", "facebook", "amazon"].includes(baseName)) {
        generatedResults[0].available = false;
      }

      setResults(generatedResults);
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const mainResult = results[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] p-6 lg:p-8">
      {/* Hero Section */}
      <div className="relative text-gray-900 dark:text-white py-12 px-6 md:px-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 mix-blend-multiply"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 mix-blend-multiply"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 pb-2">
              Find your perfect domain
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
              Search across 500+ TLDs instantly. Secure your brand identity with
              the world's most reliable domain registrar.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-[#1a1f26] p-1 rounded-full inline-flex items-center gap-1 border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("search")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "search"
                    ? "bg-white dark:bg-[#2d333b] text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Domain search
              </button>
              <button
                onClick={() => setActiveTab("generator")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "generator"
                    ? "bg-white dark:bg-[#2d333b] text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Generator
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
            <div className="relative flex items-center bg-white dark:bg-[#151921] p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
              <Search className="ml-4 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Type the domain you want (e.g., mybrand.com)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-none shadow-none focus-visible:ring-0 text-gray-900 dark:text-white text-lg placeholder:text-gray-400 h-14 bg-transparent"
              />
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results Section */}
      <div className="max-w-5xl mx-auto pb-20">
        <AnimatePresence mode="wait">
          {hasSearched && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Main Result – only render when exists */}
              {mainResult && (
                <div className="bg-white dark:bg-[#151921] rounded-[24px] border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          mainResult.available
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {mainResult.available ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <XCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          {mainResult.domain}
                          {mainResult.available && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Available
                            </span>
                          )}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          {mainResult.available
                            ? "Congratulations! This domain is available."
                            : "Sorry, this domain is already taken."}
                        </p>
                      </div>
                    </div>

                    {mainResult.available && (
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        <div className="flex items-baseline gap-2">
                          {mainResult.sale && (
                            <span className="text-sm text-gray-400 line-through">
                              ${mainResult.originalPrice}
                            </span>
                          )}
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${mainResult.price}
                          </span>
                        </div>
                        <Button className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl h-12 px-8 font-semibold text-lg">
                          Add to Cart
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Options */}
              {results.length > 1 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-2">
                    More Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.slice(1).map((result, index) => (
                      <motion.div
                        key={result.domain}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {result.domain}
                              {result.popular && (
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {result.available ? (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Available
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Taken
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              {result.sale && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${result.originalPrice}
                                </span>
                              )}
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                ${result.price}
                              </span>
                            </div>
                            {result.available && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-0 h-auto font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                              >
                                Buy Now <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!hasSearched && !isSearching && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-6">
              {tlds.map((tld, index) => (
                <motion.div
                  key={tld.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-indigo-500 transition-all cursor-pointer group shadow-sm"
                >
                  <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tld.name}
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 line-through">
                      {tld.price}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {tld.sale}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Features */}
        {!hasSearched && !isSearching && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="h-12 w-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Global Reach
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Connect with customers worldwide using our premium domain
                extensions and reliable DNS services.
              </p>
            </div>
            <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Instant Activation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Get your domain up and running in minutes with our streamlined
                setup process and auto-configuration.
              </p>
            </div>
            <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                AI Suggestions
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Not sure what to pick? Let our AI generate creative and
                available domain names for your brand.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainFinderPage;

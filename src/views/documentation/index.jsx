import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOCS_CATEGORIES } from "./docsData";
import { cn } from "@/lib/utils";

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filter categories and articles based on search query
  const filteredCategories = DOCS_CATEGORIES.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="header-home"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Merchant <span className="text-violet-600">Manual</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about growing your business with SquadCart. Non-technical, simple, and effective.
            </p>

            <div className="mt-8 max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors w-5 h-5" />
              <Input
                placeholder="Search for guides, features, or tips..."
                className="pl-12 h-14 bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl focus:ring-violet-500/20 focus:border-violet-500 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="header-category"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  <span className="cursor-pointer hover:text-violet-600 transition-colors" onClick={() => setSelectedCategory(null)}>Documentation</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-violet-600">{selectedCategory.title}</span>
                </nav>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {selectedArticle ? selectedArticle.title : selectedCategory.title}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="grid-categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer p-8 bg-white dark:bg-[#1a1f26] rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-violet-500/20 transition-all duration-300 relative overflow-hidden"
              >
                <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110", category.bg, category.color)}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {category.description}
                </p>
                <div className="flex items-center text-xs font-bold text-violet-600 uppercase tracking-wider gap-2">
                  View {category.articles.length} Articles
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              </motion.div>
            ))}
          </motion.div>
        ) : selectedArticle ? (
          <motion.div
            key="article-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl p-8 md:p-12 overflow-hidden relative"
          >
            <div className="prose prose-violet dark:prose-invert max-w-none">
              <div className="flex items-center gap-2 text-amber-500 mb-8 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl w-fit border border-amber-100 dark:border-amber-500/20">
                <Clock className="w-4 h-4 text-xs font-medium" />
                <span className="text-xs font-bold uppercase tracking-wider">5 Min Read</span>
              </div>
              
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.trim().replace(/\n/g, '<br/>') }} className="text-gray-700 dark:text-gray-300 text-lg leading-loose" />
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Was this helpful?</p>
                  <p className="text-xs text-gray-500">Your feedback helps us improve our guides.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl px-6">Yes, thanks!</Button>
                <Button variant="outline" className="rounded-xl px-6">Not really</Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-articles"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {selectedCategory.articles.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ x: 10 }}
                onClick={() => handleArticleClick(article)}
                className="group cursor-pointer p-6 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm hover:shadow-lg hover:border-violet-500 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                    {article.title}
                  </h4>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Support Section */}
      {!selectedArticle && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tight">Still stuck?</h2>
            <p className="text-violet-100 max-w-md text-lg">
              Our support heroes are available 24/7 to help you with any issues. Just open a ticket and we'll get back to you ASAP.
            </p>
          </div>
          <Button 
            onClick={() => window.location.href='/help/create'}
            className="relative z-10 h-16 px-10 bg-white text-violet-700 hover:bg-violet-50 rounded-2xl text-lg font-black shadow-xl hover:scale-105 transition-all"
          >
            Talk to an Expert
          </Button>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />
        </motion.div>
      )}
    </div>
  );
};

export default DocumentationPage;

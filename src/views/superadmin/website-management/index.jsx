import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { 
  Globe, 
  Layout, 
  Zap, 
  CreditCard, 
  MessageSquare, 
  Save, 
  RefreshCw,
  Edit3,
  Eye,
  HelpCircle,
  Link,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Settings,
  Star
} from "lucide-react";
import toast from "react-hot-toast";

import { 
  useGetLandingPageContentQuery, 
  useUpdateLandingPageContentMutation 
} from "@/features/website-management/websiteManagementApiSlice";

/**
 * Website Management Dashboard for Super Admins.
 * Allows making the squadcart-frontend dynamic by editing section content.
 */
const WebsiteManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "hero";

  const { data: sections, isLoading, refetch } = useGetLandingPageContentQuery();
  const [updateContent, { isLoading: isUpdating }] = useUpdateLandingPageContentMutation();

  const [activeTab, setActiveTabState] = useState(initialTab);
  const [draftContent, setDraftContent] = useState({});

  // Sync activeTab with URL if URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab });
  };

  // section helper mapping
  const sectionConfig = {
    hero: { label: "Hero Section", icon: <Globe size={18} /> },
    features: { label: "Features", icon: <Layout size={18} /> },
    pricing: { label: "Pricing", icon: <CreditCard size={18} /> },
    benefits: { label: "Benefits", icon: <Zap size={18} /> },
    reviews: { label: "Reviews/Testimonials", icon: <MessageSquare size={18} /> },
    faq: { label: "FAQ Section", icon: <HelpCircle size={18} /> },
    integrations: { label: "Integrations", icon: <Link size={18} /> },
    why_choose_us: { label: "Why Choose Us", icon: <Star size={18} /> },
    policies: { label: "Legal Policies", icon: <ShieldCheck size={18} /> },
    footer: { label: "Footer & Social", icon: <Settings size={18} /> },
  };

  /**
   * Initialize or update local draft state when switching tabs or data loads.
   */
  const currentSection = sections?.find(s => s.key === activeTab);
  const currentContent = draftContent[activeTab] || currentSection?.content || {};

  const handleInputChange = (field, value) => {
    setDraftContent(prev => ({
      ...prev,
      [activeTab]: {
        ...currentContent,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await updateContent({
        key: activeTab,
        content: currentContent
      }).unwrap();
      toast.success(`${sectionConfig[activeTab].label} updated successfully!`);
      // Clear draft for this tab to show fresh values from server
      const newDrafts = { ...draftContent };
      delete newDrafts[activeTab];
      setDraftContent(newDrafts);
    } catch (error) {
      toast.error("Failed to update content. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-[var(--primary-green)]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Management</h1>
          <p className="text-muted-foreground">Manage dynamic content for the squadcart-frontend landing page.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-border hover:bg-surface transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="w-full">
        {/* Editor Area */}
        <div className="w-full">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[32px] p-8 md:p-10 shadow-sm space-y-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface rounded-xl text-[var(--primary-green)]">
                  {sectionConfig[activeTab].icon}
                </div>
                <h2 className="text-xl font-bold">{sectionConfig[activeTab].label} Editor</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-surface transition-colors">
                  <Eye size={16} /> Preview
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--primary-green)] text-black rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
                  Save Changes
                </button>
              </div>
            </div>

            {/* Dynamic Form based on Tab */}
              {activeTab === "hero" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Hero Title</label>
                    <input 
                      type="text"
                      value={currentContent.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                      placeholder="e.g., Start Your Global Commerce Journey"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Hero Subtitle</label>
                    <textarea 
                      rows={4}
                      value={currentContent.subtitle || ""}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                      placeholder="Describe your platform's value proposition..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold ml-1">Primary Button Text</label>
                       <input 
                         type="text"
                         value={currentContent.primaryBtn || ""}
                         onChange={(e) => handleInputChange("primaryBtn", e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold ml-1">Secondary Button Text</label>
                       <input 
                         type="text"
                         value={currentContent.secondaryBtn || ""}
                         onChange={(e) => handleInputChange("secondaryBtn", e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                       />
                     </div>
                  </div>
                </div>
              )}

              {/* FAQ Editor */}
              {activeTab === "faq" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Section Badge</label>
                    <input 
                      type="text"
                      value={currentContent.badge || ""}
                      onChange={(e) => handleInputChange("badge", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Section Title</label>
                    <input 
                      type="text"
                      value={currentContent.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                    />
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">Questions & Answers</h3>
                      <button 
                        onClick={() => {
                          const items = [...(currentContent.items || [])];
                          items.push({ question: "New Question", answer: "New Answer" });
                          handleInputChange("items", items);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-[var(--primary-green)] hover:underline"
                      >
                        <Plus size={14} /> Add FAQ
                      </button>
                    </div>
                    
                    {(currentContent.items || []).map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-border bg-surface space-y-3 relative group">
                        <button 
                          onClick={() => {
                            const items = currentContent.items.filter((_, i) => i !== idx);
                            handleInputChange("items", items);
                          }}
                          className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <input 
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const items = [...currentContent.items];
                            items[idx] = { ...items[idx], question: e.target.value };
                            handleInputChange("items", items);
                          }}
                          placeholder="Question"
                          className="w-full bg-transparent font-bold focus:outline-none"
                        />
                        <textarea 
                          value={faq.answer}
                          onChange={(e) => {
                            const items = [...currentContent.items];
                            items[idx] = { ...items[idx], answer: e.target.value };
                            handleInputChange("items", items);
                          }}
                          placeholder="Answer"
                          className="w-full bg-transparent text-sm text-muted-foreground focus:outline-none resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Editor */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Section Title</label>
                    <input 
                      type="text"
                      value={currentContent.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                    />
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">Testimonials</h3>
                      <button 
                        onClick={() => {
                          const items = [...(currentContent.items || [])];
                          items.push({ name: "User Name", quote: "User testimonial quote...", role: "Merchant" });
                          handleInputChange("items", items);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-[var(--primary-green)] hover:underline"
                      >
                        <Plus size={14} /> Add Review
                      </button>
                    </div>
                    
                    {(currentContent.items || []).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-border bg-surface space-y-3 relative group">
                        <button 
                          onClick={() => {
                            const items = currentContent.items.filter((_, i) => i !== idx);
                            handleInputChange("items", items);
                          }}
                          className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex gap-4">
                           <div className="flex-1 space-y-2">
                              <input 
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const items = [...currentContent.items];
                                  items[idx] = { ...items[idx], name: e.target.value };
                                  handleInputChange("items", items);
                                }}
                                className="w-full font-bold bg-transparent focus:outline-none"
                              />
                              <textarea 
                                value={item.quote}
                                onChange={(e) => {
                                  const items = [...currentContent.items];
                                  items[idx] = { ...items[idx], quote: e.target.value };
                                  handleInputChange("items", items);
                                }}
                                className="w-full text-sm text-muted-foreground bg-transparent focus:outline-none resize-none"
                              />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Policies Editor */}
              {activeTab === "policies" && (
                <div className="space-y-8">
                   {["privacy", "terms", "refund"].map(policyKey => (
                     <div key={policyKey} className="space-y-4">
                        <h3 className="font-bold capitalize">{policyKey.replace("-", " ")} Policy Content</h3>
                        <div className="space-y-2">
                           <label className="text-xs text-muted-foreground ml-1">Title</label>
                           <input 
                             type="text"
                             value={currentContent[policyKey]?.title || ""}
                             onChange={(e) => {
                               const pol = { ...(currentContent[policyKey] || {}) };
                               pol.title = e.target.value;
                               handleInputChange(policyKey, pol);
                             }}
                             className="w-full px-4 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs text-muted-foreground ml-1">Full Content (HTML/Markdown support)</label>
                           <textarea 
                             rows={10}
                             value={currentContent[policyKey]?.body || ""}
                             onChange={(e) => {
                               const pol = { ...(currentContent[policyKey] || {}) };
                               pol.body = e.target.value;
                               handleInputChange(policyKey, pol);
                             }}
                             className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30 font-mono text-sm"
                           />
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* Integrations Editor */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Section Title</label>
                    <input 
                      type="text"
                      value={currentContent.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Section Description</label>
                    <textarea 
                      rows={3}
                      value={currentContent.desc || ""}
                      onChange={(e) => handleInputChange("desc", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                    />
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <h3 className="font-bold">Integration Items</h3>
                    {(currentContent.items || []).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-border bg-surface space-y-3 relative group">
                        <input 
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const items = [...currentContent.items];
                            items[idx] = { ...items[idx], name: e.target.value };
                            handleInputChange("items", items);
                          }}
                          className="w-full font-bold bg-transparent focus:outline-none"
                          placeholder="Integration Name"
                        />
                        <textarea 
                          value={item.description}
                          onChange={(e) => {
                            const items = [...currentContent.items];
                            items[idx] = { ...items[idx], description: e.target.value };
                            handleInputChange("items", items);
                          }}
                          className="w-full text-sm text-muted-foreground bg-transparent focus:outline-none resize-none"
                          placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Editor */}
              {activeTab === "footer" && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Facebook URL</label>
                        <input 
                          type="text"
                          value={currentContent.facebook || ""}
                          onChange={(e) => handleInputChange("facebook", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">LinkedIn URL</label>
                        <input 
                          type="text"
                          value={currentContent.linkedin || ""}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold ml-1">Support Email</label>
                     <input 
                       type="email"
                       value={currentContent.email || ""}
                       onChange={(e) => handleInputChange("email", e.target.value)}
                       className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold ml-1">Copyright Text</label>
                     <input 
                       type="text"
                       value={currentContent.copyright || ""}
                       onChange={(e) => handleInputChange("copyright", e.target.value)}
                       className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/30"
                     />
                   </div>
                </div>
              )}

              {/* Placeholder for other sections */}
              {!["hero", "faq", "reviews", "policies", "integrations", "footer"].includes(activeTab) && (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                  <Edit3 size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Editor for {sectionConfig[activeTab].label} is coming soon.</p>
                  <p className="text-sm">We are progressively adding specific controls for all sections.</p>
                </div>
              )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManagementPage;

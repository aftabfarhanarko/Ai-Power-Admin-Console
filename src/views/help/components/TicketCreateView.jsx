import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  Sparkles,
  FileText,
  Tag,
  Send,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";

export default function TicketCreateView({ setActiveView }) {
  const authUser = useSelector((state) => state.auth.user);
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState("");
  const [attachments, setAttachments] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 2 * 1024 * 1024; // 2MB per file
    const maxFiles = 5;
    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} attachments allowed.`);
      return;
    }
    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`"${file.name}" is too large. Max 2MB per file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [...prev, { name: file.name, dataUrl: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const email = typeof authUser?.email === "string" ? authUser.email.trim() : "";
    if (!email) {
      toast.error("Please sign in with an email to create a ticket.");
      return;
    }
    const issueText = [subject.trim(), description.trim()].filter(Boolean).join("\n\n");
    if (!issueText) {
      toast.error("Please enter a subject or description.");
      return;
    }
    const tagsArray = tags
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const attachmentUrls = attachments.map((a) => (typeof a === "string" ? a : a.dataUrl));
    try {
      const res = await createHelp({
        email: String(email),
        issue: String(issueText),
        priority: priority || "medium",
        tags: tagsArray,
        attachments: attachmentUrls,
      });
      if (res?.data) {
        toast.success("Ticket created successfully.");
        setActiveView("list");
      } else {
        toast.error(res?.error?.data?.message || "Failed to create ticket.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create ticket.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-md">
      <div className="relative px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 via-white to-white dark:from-violet-900/10 dark:via-[#1a1f26] dark:to-[#1a1f26] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveView("list")}
            className="hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 flex items-center gap-2"
            >
              Create New Ticket{" "}
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </motion.h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Fill in the details below to submit a new support request.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/50 dark:bg-gray-900/50"
      >
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  Ticket Information
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-violet-600 transition-colors">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of the issue"
                      className="w-full h-14 px-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-violet-600 transition-colors">
                      Description
                    </label>
                    <textarea
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none resize-none transition-all placeholder:text-gray-400"
                      placeholder="Detailed description of the problem..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Attachments
                    </label>
                    <input
                      type="file"
                      id="ticket-attachments"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="ticket-attachments"
                      className="block p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors cursor-pointer text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Paperclip className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Images, PDF, DOC (max. 2MB each, up to 5 files)
                      </p>
                    </label>
                    {attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {attachments.map((a, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
                          >
                            <span className="truncate">{typeof a === "string" ? a : a.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(i)}
                              className="text-red-500 hover:text-red-600 ml-2 shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>

            
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6"
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-500" /> Ticket Properties
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-700 dark:text-gray-200"
                      >
                        <option value="high">Important (High)</option>
                        <option value="medium">Mid Important (Medium)</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Tags
                    </label>
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Add tags..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-semibold group disabled:opacity-60"
                    >
                      {isCreating ? "Creating…" : "Create Ticket"}{" "}
                      <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView("list")}
                      className="w-full h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

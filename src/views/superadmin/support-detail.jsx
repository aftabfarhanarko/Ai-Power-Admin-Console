import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Inbox } from "lucide-react";
import { useGetHelpByIdQuery, useAddHelpReplyMutation } from "@/features/help/helpApiSlice";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

const SuperAdminSupportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Support");

  const { data: ticket, isLoading } = useGetHelpByIdQuery(numericId, {
    skip: !numericId || isNaN(numericId),
  });
  const [addReply, { isLoading: isReplying }] = useAddHelpReplyMutation();

  const messages = useMemo(() => {
    if (!ticket) return [];
    const list = [];
    if (ticket.issue) {
      list.push({
        id: "issue",
        senderId: "customer",
        content: ticket.issue,
        timestamp: ticket.createdAt,
        author: ticket.email,
      });
    }
    (ticket.replies || []).forEach((r, i) => {
      list.push({
        id: `r-${i}`,
        senderId: r.author === replyAuthor ? "me" : "customer",
        content: r.message,
        timestamp: r.createdAt,
        author: r.author,
      });
    });
    return list;
  }, [ticket, replyAuthor]);

  const handleSendReply = async (e) => {
    e?.preventDefault?.();
    const text = (replyText || "").trim();
    if (!text) return;
    try {
      await addReply({
        id: numericId,
        body: { message: text, author: replyAuthor.trim() || "Support" },
      }).unwrap();
      setReplyText("");
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading ticket…</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8">
        <p className="text-sm text-red-500">Ticket not found or no longer available.</p>
      </div>
    );
  }

  const subject = ticket.issue?.split("\n")[0]?.slice(0, 80) || `Ticket #${ticket.id}`;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="flex h-full bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Main area - same structure as TicketDetailView */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1f26] relative z-0">
          {/* Header */}
          <div className="h-16 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/superadmin/support")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {subject}
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 font-mono">
                    #{ticket.id}
                  </span>
                </h2>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  Requested by{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {ticket.email ?? "—"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                  ticket.status === "resolved"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
                    : ticket.status === "closed"
                    ? "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                    : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
                }`}
              >
                {ticket.status?.replace("_", " ") ?? "pending"}
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-black/20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Inbox className="w-10 h-10 opacity-40" />
                </div>
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === "me";
                const senderName = isMe ? "You" : (msg.author ?? "Customer");

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={msg.id}
                    className={`flex gap-4 max-w-3xl group ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      {isMe ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
                          YOU
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-xs shadow-sm">
                          {senderName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={`flex items-center gap-2 mb-1 ${isMe ? "justify-end" : ""}`}
                      >
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(
                            msg.timestamp ? new Date(msg.timestamp) : new Date(),
                            "HH:mm"
                          )}
                        </span>
                      </div>
                      <div
                        className={
                          isMe
                            ? "p-5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-indigo-500/10"
                            : "p-5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Reply input - like TicketDetailView */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-[#1a1f26]">
            <form onSubmit={handleSendReply} className="space-y-3">
              <div className="flex gap-2 items-end flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Author name
                  </label>
                  <input
                    type="text"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="e.g. Support"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    disabled={isReplying}
                  />
                </div>
              </div>
              <div className="relative group">
                <textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-4 pr-24 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[80px] transition-all"
                  rows={3}
                  disabled={isReplying}
                />
                <div className="absolute bottom-3 right-3">
                  <Button
                    type="submit"
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    disabled={isReplying || !replyText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSupportDetailPage;

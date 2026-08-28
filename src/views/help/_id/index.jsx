import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetHelpByIdQuery,
  useAddHelpReplyMutation,
  useUpdateHelpMutation,
} from "@/features/help/helpApiSlice";
import { useSelector } from "react-redux";
import { useHelpSocket } from "@/hooks/useHelpSocket";
import TicketDetailView from "@/pages/help/components/TicketDetailView";

const HelpDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const { data: ticket, isLoading, refetch } = useGetHelpByIdQuery(id, {
    skip: !id,
  });

  const handleNewReply = useCallback(() => {
    refetch();
  }, [refetch]);

  useHelpSocket(id, {
    onReply: handleNewReply,
    currentUserName: authUser?.name || "",
    playSound: true,
  });

  const [addReply, { isLoading: isReplying }] = useAddHelpReplyMutation();
  const [updateHelp] = useUpdateHelpMutation();

  const handleReply = useCallback(
    async (message) => {
      if (!ticket?.id || !authUser?.name) return;
      try {
        await addReply({
          id: ticket.id,
          body: { message: message.trim(), author: authUser.name },
        }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to add reply:", err);
      }
    },
    [ticket?.id, authUser?.name, addReply, refetch]
  );

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!ticket?.id) return;
      try {
        await updateHelp({ id: ticket.id, body: { status: newStatus } }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    [ticket?.id, updateHelp, refetch]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("common.loading") || "Loading ticket…"}
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8">
        <p className="text-sm text-red-500">
          {t("help.ticketNotFound") || "Ticket not found or no longer available."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px]">
      <TicketDetailView
        ticket={ticket}
        onBack={() => navigate("/help")}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
        isReplying={isReplying}
        hideSidebar
        currentUserName={authUser?.name ?? ""}
      />
    </div>
  );
};

export default HelpDetailPage;

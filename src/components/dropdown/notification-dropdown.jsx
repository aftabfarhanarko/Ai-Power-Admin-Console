import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import NotificationCard from "@/pages/settings/notification/notification-card";

import { Switch } from "@/components/ui/switch";
import { Bell, CheckCheck, FolderOpen } from "lucide-react";
import { useUpdateNotificationMutation } from "@/features/notification/notificationApiSlice";
import toast from "react-hot-toast";

const NotificationDropdown = ({ children, data, unReadCount }) => {
  const [isPushNotificationActive, setIsPushNotificationActive] =
    useState(true);

  const [updateNotification, { isLoading }] = useUpdateNotificationMutation();

  const handleMarkAllAsRead = async () => {
    const bodyData = { isMarkAllRead: true };
    const res = await updateNotification(bodyData);
    if (res && res?.data?.success) {
      toast.success(res?.data?.message);
    }
  };

  const handleMarkRead = async (id) => {
    const bodyData = { notificationId: id };
    const res = await updateNotification(bodyData);
    if (res && res?.data?.success) {
      toast.success(res?.data?.message);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="lg:w-[460px] w-screen p-4 lg:max-h-[calc(100vh-8rem)] max-h-screen h-full restro_scrollbar_mini">
          <div className="flbx">
            <div className="fl gap-3">
              <h2 className="text-xl text-black dark:text-white">
                Notification
              </h2>
              <div className="h-6 w-6 bg-primary rounded-full text-white center">
                {unReadCount}
              </div>
            </div>
            <span
              onClick={unReadCount > 0 && handleMarkAllAsRead}
              className={`${
                unReadCount > 0
                  ? "tr cursor-pointer hover:text-black hover:dark:text-white"
                  : "cursor-default"
              } text-sm text-black/50  dark:text-white/50 fl gap-2 `}
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </span>
          </div>
          <div className="border dark:border-white/20 rounded-xl p-4 flex gap-4 mb-2 mt-4">
            <Bell className="text-black/40 mt-1 h-5 w-5 dark:text-white/50" />
            <div className="flex-1">
              <h2 className="text-black dark:text-white/90">
                Push Notification
              </h2>
              <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                Automatically send new notifications
              </p>
            </div>
            <Switch
              checked={isPushNotificationActive}
              onCheckedChange={() =>
                setIsPushNotificationActive(!isPushNotificationActive)
              }
            />
          </div>
          {data?.length > 0 ? (
            data?.map((notification, index) => (
              <NotificationCard
                key={index}
                isDropdowon
                notification={notification}
                onClick={() =>
                  !notification?.isRead && handleMarkRead(notification?._id)
                }
              />
            ))
          ) : (
            <div className="center h-48 w-full text-sm dark:text-white/50 text-black/50">
              <FolderOpen strokeWidth={1} />
              <span className="mt-3 block text-center max-w-sm">
                You have currently no notification. Play along in the platform
                to have some!
              </span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;

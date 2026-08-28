import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import {
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { userDetailsFetched } from "@/features/auth/authSlice";

const OrderNotificationSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;
  const user = authUser || null;
  
  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();

  // Order notification form
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      whatsapp: "",
    },
  });

  // Load notification settings from user data or localStorage on mount
  useEffect(() => {
    if (user) {
      reset({
        email: user.notificationConfig?.email || localStorage.getItem("notificationEmail") || "",
        whatsapp: user.notificationConfig?.whatsapp || localStorage.getItem("notificationWhatsapp") || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }

    try {
      const payload = {
        notificationConfig: {
          email: data.email,
          whatsapp: data.whatsapp,
        },
      };

      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        // Also save to localStorage for backward compatibility
        localStorage.setItem("notificationEmail", data.email);
        localStorage.setItem("notificationWhatsapp", data.whatsapp);
        
        // Update Redux state and localStorage immediately
        dispatch(userDetailsFetched(payload));
        
        toast.success(t("settings.notificationSaved"));
      } else {
        toast.error(res?.error?.data?.message || t("settings.notificationSaveFailed"));
      }
    } catch (e) {
      toast.error(t("settings.notificationSaveFailedShort"));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("settings.orderNotificationSettings")}</h2>
      <Card className="border border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base font-semibold">{t("settings.notificationPreferences")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                {t("settings.emailForNotifications")}
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder={t("settings.emailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                {t("settings.whatsappForNotifications")}
              </label>
              <input
                type="tel"
                {...register("whatsapp")}
                className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder={t("settings.whatsappPlaceholder")}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isUpdating}>
                <Bell className="h-4 w-4 mr-2" />
                {isUpdating ? t("common.saving") : t("createEdit.saveNotificationSettings")}
              </Button>
            </div>
            <div className="text-xs text-black/50 dark:text-white/50 mt-2">
              {t("settings.notificationNote")}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderNotificationSettings;

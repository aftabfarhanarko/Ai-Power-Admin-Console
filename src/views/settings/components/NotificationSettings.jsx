import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageCircle,
  Loader2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Package,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { motion } from "framer-motion";

const NotificationSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;
  const user = userFromApi ?? authUser ?? null;

  const [updateSystemuser, { isLoading: isSaving }] =
    useUpdateSystemuserMutation();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      email: "",
      whatsapp: "",
      emailEnabled: true,
      whatsappEnabled: true,
      preferences: {
        newOrder: { email: true, whatsapp: true },
        orderStatus: { email: true, whatsapp: false },
        lowStock: { email: true, whatsapp: true },
        promotions: { email: false, whatsapp: false },
        security: { email: true, whatsapp: true },
      },
    },
  });

  const emailEnabled = watch("emailEnabled");
  const whatsappEnabled = watch("whatsappEnabled");
  const preferences = watch("preferences");

  useEffect(() => {
    if (!user) return;
    const config = user.notificationConfig;
    reset({
      email: config?.email ?? "",
      whatsapp: config?.whatsapp ?? "",
      emailEnabled: config?.emailEnabled ?? true,
      whatsappEnabled: config?.whatsappEnabled ?? true,
      preferences: config?.preferences ?? {
        newOrder: { email: true, whatsapp: true },
        orderStatus: { email: true, whatsapp: false },
        lowStock: { email: true, whatsapp: true },
        promotions: { email: false, whatsapp: false },
        security: { email: true, whatsapp: true },
      },
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }
    try {
      const payload = {
        notificationConfig: {
          email: data.email?.trim() || null,
          whatsapp: data.whatsapp?.trim() || null,
          emailEnabled: data.emailEnabled,
          whatsappEnabled: data.whatsappEnabled,
          preferences: data.preferences,
        },
      };
      await updateSystemuser({ id: userId, ...payload }).unwrap();
      dispatch(userDetailsFetched(payload));
      toast.success(
        t("settings.notificationConfigSaved") || "Notification settings updated",
      );
    } catch (e) {
      toast.error(
        e?.data?.message ||
          t("settings.notificationConfigFailed") ||
          "Failed to save settings",
      );
    }
  };

  const handlePreferenceToggle = (key, channel) => {
    if (!preferences || !preferences[key]) return;
    setValue(`preferences.${key}.${channel}`, !preferences[key][channel], {
      shouldDirty: true,
    });
  };

  const notificationTypes = [
    {
      id: "newOrder",
      title: "New Orders",
      description: "Get notified when a customer places a new order.",
      icon: ShoppingBag,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "orderStatus",
      title: "Order Status Updates",
      description: "Updates when order status changes (e.g., Shipped, Delivered).",
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "lowStock",
      title: "Low Stock Alerts",
      description: "Receive alerts when product inventory runs low.",
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "promotions",
      title: "Promotions & Tips",
      description: "Marketing insights and platform tips to grow your business.",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "security",
      title: "Account Security",
      description: "Alerts for new logins and sensitive account changes.",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bell className="h-5 w-5 text-white" />
            </div>
            {t("settings.notifications") || "Notification Preferences"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
            {t("settings.notificationConfigDesc") ||
              "Manage how and when you receive notifications. Customize your channels and alert types to stay on top of your business."}
          </p>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 h-12"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Channels */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[24px] shadow-xl border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Contact Channels
              </CardTitle>
              <CardDescription>
                Where should we send your alerts?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email Channel */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                emailEnabled 
                  ? "border-violet-100 dark:border-violet-900/30 bg-violet-50/30 dark:bg-violet-900/10" 
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">Email</span>
                  </div>
                  <Switch
                    checked={emailEnabled}
                    onCheckedChange={(checked) => setValue("emailEnabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="name@company.com"
                    disabled={!emailEnabled}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-all"
                  />
                  {emailEnabled && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active channel</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Channel */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                whatsappEnabled
                  ? "border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">WhatsApp</span>
                  </div>
                  <Switch
                    checked={whatsappEnabled}
                    onCheckedChange={(checked) => setValue("whatsappEnabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    {...register("whatsapp")}
                    placeholder="+1234567890"
                    disabled={!whatsappEnabled}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-all"
                  />
                  {whatsappEnabled && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active channel</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Triggers */}
        <div className="lg:col-span-2">
          <Card className="rounded-[24px] shadow-xl border-gray-100 dark:border-gray-800 overflow-hidden h-full">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Notification Triggers</CardTitle>
                  <CardDescription>
                    Choose what you want to be notified about
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                  <span className="w-12 text-center">Email</span>
                  <span className="w-12 text-center">WA</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notificationTypes.map((type) => (
                  <motion.div 
                    key={type.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-xl ${type.bgColor} flex items-center justify-center ${type.color} group-hover:scale-110 transition-transform duration-300`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {type.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-4">
                      <div className="w-12 flex justify-center">
                        <Switch
                          checked={preferences?.[type.id]?.email}
                          onCheckedChange={() => handlePreferenceToggle(type.id, 'email')}
                          disabled={!emailEnabled}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                      <div className="w-12 flex justify-center">
                        <Switch
                          checked={preferences?.[type.id]?.whatsapp}
                          onCheckedChange={() => handlePreferenceToggle(type.id, 'whatsapp')}
                          disabled={!whatsappEnabled}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

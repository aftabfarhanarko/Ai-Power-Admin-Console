import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Key, Loader2, Copy, Eye, EyeOff, Check } from "lucide-react";
import {
  hasPermission,
  FeaturePermission,
} from "@/constants/feature-permission";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const CredentialInput = ({
  label,
  id,
  register,
  name,
  placeholder,
  watch,
  type = "text",
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const value = watch(name);

  const handleCopy = (e) => {
    e.preventDefault();
    if (!value) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const inputType = type === "password" && !showPassword ? "password" : "text";

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={id}
            type={inputType}
            {...register(name)}
            className="w-full h-11 px-3 py-2 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all text-sm"
            placeholder={placeholder}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="h-11 px-4 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl shrink-0"
        >
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-gray-500" />
          )}
          <span className="ml-2 hidden sm:inline font-normal">
            {copied ? "Copied" : "Copy"}
          </span>
        </Button>
      </div>
    </div>
  );
};

const CourierSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;
  const user = userFromApi ?? authUser ?? null;

  const [updateSystemuser] = useUpdateSystemuserMutation();
  const [savingCourier, setSavingCourier] = React.useState(null);

  const {
    register: registerPathao,
    handleSubmit: handleSubmitPathao,
    reset: resetPathao,
    watch: watchPathao,
  } = useForm({
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  const {
    register: registerSteadfast,
    handleSubmit: handleSubmitSteadfast,
    reset: resetSteadfast,
    watch: watchSteadfast,
  } = useForm({
    defaultValues: {
      apiKey: "",
      secretKey: "",
    },
  });

  const {
    register: registerRedX,
    handleSubmit: handleSubmitRedX,
    reset: resetRedX,
    watch: watchRedX,
  } = useForm({
    defaultValues: {
      token: "",
      sandbox: false,
    },
  });

  useEffect(() => {
    if (!user) return;
    resetPathao({
      clientId: user.pathaoConfig?.clientId || "",
      clientSecret: user.pathaoConfig?.clientSecret || "",
    });
  }, [user, resetPathao]);

  useEffect(() => {
    if (!user) return;
    resetSteadfast({
      apiKey: user.steadfastConfig?.apiKey || "",
      secretKey: user.steadfastConfig?.secretKey || "",
    });
  }, [user, resetSteadfast]);

  useEffect(() => {
    if (!user) return;
    resetRedX({
      token: user.redxConfig?.token || "",
      sandbox: user.redxConfig?.sandbox !== false,
    });
  }, [user, resetRedX]);

  const onSubmitPathao = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }
    setSavingCourier("pathao");
    try {
      const payload = {
        pathaoConfig: {
          clientId: data.clientId || "",
          clientSecret: data.clientSecret || "",
        },
      };
      await updateSystemuser({ id: userId, ...payload }).unwrap();
      localStorage.setItem("pathaoClientId", data.clientId);
      localStorage.setItem("pathaoClientSecret", data.clientSecret);
      dispatch(userDetailsFetched(payload));
      toast.success(t("pathao.credentialsSaved"));
    } catch (e) {
      toast.error(e?.data?.message || t("pathao.credentialsFailed"));
    } finally {
      setSavingCourier(null);
    }
  };

  const onSubmitSteadfast = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }
    setSavingCourier("steadfast");
    try {
      const payload = {
        steadfastConfig: {
          apiKey: data.apiKey || "",
          secretKey: data.secretKey || "",
        },
      };
      await updateSystemuser({ id: userId, ...payload }).unwrap();
      localStorage.setItem("steadfastApiKey", data.apiKey);
      localStorage.setItem("steadfastSecretKey", data.secretKey);
      dispatch(userDetailsFetched(payload));
      toast.success(t("steadfast.credentialsSaved"));
    } catch (e) {
      toast.error(e?.data?.message || t("steadfast.credentialsFailed"));
    } finally {
      setSavingCourier(null);
    }
  };

  const onSubmitRedX = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }
    setSavingCourier("redx");
    try {
      const payload = {
        redxConfig: {
          token: data.token || "",
          sandbox: data.sandbox === true,
        },
      };
      await updateSystemuser({ id: userId, ...payload }).unwrap();
      localStorage.setItem("redxToken", data.token);
      localStorage.setItem("redxSandbox", data.sandbox ? "true" : "false");
      dispatch(userDetailsFetched(payload));
      toast.success(t("redx.credentialsSaved"));
    } catch (e) {
      toast.error(e?.data?.message || t("redx.credentialsFailed"));
    } finally {
      setSavingCourier(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {t("Courier Integration Settings")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your courier API keys and integration settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pathao Credentials */}
        {hasPermission(user, FeaturePermission.PATHAO) && (
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden bg-white dark:bg-black">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20 py-3 sm:py-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {t("pathao.credentialsTitle")}
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-normal">
                    Manage your Pathao API credentials
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={handleSubmitPathao(onSubmitPathao)}
                className="space-y-4 sm:space-y-6"
              >
                <CredentialInput
                  label={t("pathao.clientId")}
                  id="pathao-client-id"
                  register={registerPathao}
                  name="clientId"
                  placeholder={t("pathao.clientIdPlaceholder")}
                  watch={watchPathao}
                  type="text"
                />
                <CredentialInput
                  label={t("pathao.clientSecret")}
                  id="pathao-client-secret"
                  register={registerPathao}
                  name="clientSecret"
                  placeholder={t("pathao.clientSecretPlaceholder")}
                  watch={watchPathao}
                  type="password"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 transition-all"
                    disabled={savingCourier === "pathao"}
                  >
                    {savingCourier === "pathao" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    {savingCourier === "pathao"
                      ? t("common.saving")
                      : t("createEdit.savePathaoCredentials")}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t("pathao.getCredentialsFrom")}{" "}
                    <a
                      href="https://merchant.pathao.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {t("pathao.pathaoPortal")}
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Steadfast Credentials */}
        {hasPermission(user, FeaturePermission.STEADFAST) && (
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden bg-white dark:bg-black">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20 py-3 sm:py-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {t("steadfast.credentialsTitle")}
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-normal">
                    Manage your Steadfast API keys
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={handleSubmitSteadfast(onSubmitSteadfast)}
                className="space-y-4 sm:space-y-6"
              >
                <CredentialInput
                  label={t("steadfast.apiKey")}
                  id="steadfast-api-key"
                  register={registerSteadfast}
                  name="apiKey"
                  placeholder={t("steadfast.apiKeyPlaceholder")}
                  watch={watchSteadfast}
                  type="text"
                />
                <CredentialInput
                  label={t("steadfast.secretKey")}
                  id="steadfast-secret-key"
                  register={registerSteadfast}
                  name="secretKey"
                  placeholder={t("steadfast.secretKeyPlaceholder")}
                  watch={watchSteadfast}
                  type="password"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 transition-all"
                    disabled={savingCourier === "steadfast"}
                  >
                    {savingCourier === "steadfast" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    {savingCourier === "steadfast"
                      ? t("common.saving")
                      : t("createEdit.saveSteadfastCredentials")}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t("steadfast.getCredentialsFrom")}{" "}
                    <a
                      href="https://portal.packzy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-medium hover:underline"
                    >
                      {t("steadfast.steadfastPortal")}
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* RedX Credentials */}
        {hasPermission(user, FeaturePermission.REDX) && (
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden bg-white dark:bg-black">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20 py-3 sm:py-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {t("redx.credentialsTitle")}
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-normal">
                    Manage your RedX integration
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={handleSubmitRedX(onSubmitRedX)}
                className="space-y-4 sm:space-y-6"
              >
                <CredentialInput
                  label={t("redx.apiToken")}
                  id="redx-token"
                  register={registerRedX}
                  name="token"
                  placeholder={t("redx.apiTokenPlaceholder")}
                  watch={watchRedX}
                  type="password"
                />

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    {...registerRedX("sandbox")}
                    id="redx-sandbox"
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="redx-sandbox"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none"
                  >
                    {t("redx.useSandbox")}
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 transition-all"
                    disabled={savingCourier === "redx"}
                  >
                    {savingCourier === "redx" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    {savingCourier === "redx"
                      ? t("common.saving")
                      : t("redx.saveCredentials")}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t("redx.getCredentialsFrom")}{" "}
                    <a
                      href="https://redx.com.bd/developer-api/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 font-medium hover:underline"
                    >
                      {t("redx.redxPortal")}
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourierSettings;

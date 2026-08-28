import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  useGetSystemusersQuery,
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Key,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Truck,
  AlertCircle,
  Mail,
  Phone,
  BellOff,
  Trash2,
} from "lucide-react";
import { generateInvoicePDF } from "../invoice/InvoicePDFGenerator";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const SuperAdminCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [updateSystemuser, { isLoading: isUpdating }] =
    useUpdateSystemuserMutation();

  const user = useMemo(
    () => users.find((u) => String(u.id) === String(numericId)),
    [users, numericId],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data) => {
    const payload = {
      id: user.id,
      password: data.password,
    };

    const res = await updateSystemuser(payload);
    if (res?.data) {
      toast.success("Password updated successfully");
      reset();
      setIsPasswordModalOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update password");
    }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    try {
      // Attach customer information to invoice if not already present
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          companyId: user.companyId,
          phone: user.phone,
          branchLocation: user.branchLocation,
          paymentInfo: user.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Customer Detail
            </h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Review details for a single customer system user.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm rounded-xl h-11 px-5 transition-all duration-300"
            >
              <Key className="h-4 w-4" />
              Access Website
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/superadmin/customers")}
              className="bg-white text-violet-600 hover:bg-violet-50 border-0 shadow-lg shadow-black/10 rounded-xl h-11 px-5 transition-all duration-300"
            >
              Back to customers
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
        {isLoading && (
          <p className="text-sm text-slate-500">Loading customer…</p>
        )}

        {!isLoading && !user && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-12 w-12 text-rose-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Customer Not Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
              The customer you are looking for does not exist or has been
              removed.
            </p>
          </div>
        )}

        {!isLoading && user && (
          <div className="space-y-8 text-sm">
            {/* Company Logo Section */}
            {user.companyLogo && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Company Branding
                  </h3>
                </div>
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/50 inline-block shadow-sm">
                  <img
                    src={user.companyLogo}
                    alt="Company Logo"
                    className="h-24 w-auto object-contain"
                  />
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    {user.name ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Domain Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {user.domainName ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base break-all">
                    {user.email ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Company Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {user.companyName ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Company ID
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {user.companyId ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {user.phone ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Branch Location
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {user.branchLocation ?? "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Primary Color
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      style={{ backgroundColor: user.primaryColor }}
                    ></div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {user.primaryColor ?? "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Details Section */}
            {user.theme && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Theme Configuration
                  </h3>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl transition-all duration-300">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50/50 dark:bg-slate-800/20">
                          Theme Name
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                          {user.theme.name}
                        </td>
                      </tr>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Primary Color
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                              style={{
                                backgroundColor: user.theme.primaryColor,
                              }}
                            ></div>
                            <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                              {user.theme.primaryColor}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Secondary Color
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                              style={{
                                backgroundColor: user.theme.secondaryColor,
                              }}
                            ></div>
                            <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                              {user.theme.secondaryColor}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Domain URL
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                          {user.theme.domainUrl ? (
                            <a
                              href={`https://${user.theme.domainUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                              {user.theme.domainUrl}
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Logo Color Code
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.theme.logoColorCode ? (
                              <>
                                <div
                                  className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                                  style={{
                                    backgroundColor: user.theme.logoColorCode,
                                  }}
                                ></div>
                                <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                                  {user.theme.logoColorCode}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">
                                -
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Created At
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {user.theme.createdAt
                            ? new Date(user.theme.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                      <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                          Last Updated
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {user.theme.updatedAt
                            ? new Date(user.theme.updatedAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Package Information Section */}
            {user.package && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500"></div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Package Details
                  </h3>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-xl text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user.package.name}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {user.package.description}
                      </p>
                    </div>
                    {user.package.isFeatured && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-100 dark:border-amber-800/50 shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Regular Price
                      </p>
                      <p className="font-bold text-lg text-slate-800 dark:text-white">
                        ৳{parseFloat(user.package.price).toFixed(2)}
                      </p>
                    </div>
                    {user.package.discountPrice && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          Discount Price
                        </p>
                        <p className="font-bold text-lg text-emerald-700 dark:text-emerald-300">
                          ৳{parseFloat(user.package.discountPrice).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {user.package.features &&
                    user.package.features.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                          Included Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.package.features.map((feature) => (
                            <span
                              key={feature}
                              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300 dark:hover:border-indigo-800 transition-all duration-200"
                            >
                              {feature.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Courier Configurations Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-fuchsia-500 to-pink-500"></div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Courier Configuration
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pathao Config */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-fuchsia-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
                      <Truck className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      Pathao
                    </p>
                  </div>

                  {user.pathaoConfig ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Client ID
                        </p>
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                          {user.pathaoConfig.clientId ?? "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Client Secret
                        </p>
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          {user.pathaoConfig.clientSecret
                            ? "••••••••••••••••"
                            : "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Not configured
                      </p>
                    </div>
                  )}
                </div>

                {/* Steadfast Config */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Truck className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      Steadfast
                    </p>
                  </div>

                  {user.steadfastConfig ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          API Key
                        </p>
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                          {user.steadfastConfig.apiKey ?? "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Secret Key
                        </p>
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          {user.steadfastConfig.secretKey
                            ? "••••••••••••••••"
                            : "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Not configured
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Configuration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Notification Configuration
                </h3>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
                {user.notificationConfig ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Email Address
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {user.notificationConfig.email ?? "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          WhatsApp Number
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {user.notificationConfig.whatsapp ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3">
                      <BellOff className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      No notification channels configured
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500"></div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Activity Timeline
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Created At
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-11">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Last Updated
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-11">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                {user.deletedAt && (
                  <div className="border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 bg-rose-50/50 dark:bg-rose-900/10 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                        Deleted At
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 pl-11">
                      {new Date(user.deletedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Information Section */}
            {user.invoices && user.invoices.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    Invoices{" "}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      {user.invoices.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-4">
                  {user.invoices.map((invoice) => {
                    const getStatusBadge = (status) => {
                      const statusConfig = {
                        pending: {
                          color:
                            "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
                          icon: Clock,
                        },
                        paid: {
                          color:
                            "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                          icon: CheckCircle2,
                        },
                        cancelled: {
                          color:
                            "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
                          icon: XCircle,
                        },
                      };
                      const config =
                        statusConfig[status] || statusConfig.pending;
                      const Icon = config.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${config.color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      );
                    };

                    return (
                      <div
                        key={invoice.id}
                        className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              {invoice.invoiceNumber}
                            </h4>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 pl-10">
                              Transaction ID: {invoice.transactionId}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(invoice.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoicePDF(invoice)}
                              className="rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 h-9 px-4 flex items-center gap-2 transition-all duration-300 hover:scale-105"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              Total Amount
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white">
                              ৳{parseFloat(invoice.totalAmount).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                              Paid Amount
                            </p>
                            <p className="font-bold text-emerald-700 dark:text-emerald-300">
                              ৳{parseFloat(invoice.paidAmount).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50">
                            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                              Due Amount
                            </p>
                            <p className="font-bold text-rose-700 dark:text-rose-300">
                              ৳{parseFloat(invoice.dueAmount).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              Payment Type
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white capitalize">
                              {invoice.amountType}
                            </p>
                          </div>
                        </div>

                        {/* Bank Payment Info */}
                        {invoice.bankPayment && (
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                              <CreditCard className="h-4 w-4 text-slate-400" />
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                Bank Payment Details
                              </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  Bank Name
                                </p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {invoice.bankPayment.bankName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  Amount
                                </p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  ৳
                                  {parseFloat(
                                    invoice.bankPayment.amount,
                                  ).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  Account Last Digits
                                </p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                  {invoice.bankPayment.accLastDigit}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  Payment Status
                                </p>
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                                    invoice.bankPayment.status === "verified"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                      : invoice.bankPayment.status ===
                                          "rejected"
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  }`}
                                >
                                  {invoice.bankPayment.status
                                    .charAt(0)
                                    .toUpperCase() +
                                    invoice.bankPayment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bkash Payment Info */}
                        {(invoice.bkashPaymentID || invoice.bkashTrxID) && (
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="h-4 w-4 rounded-full bg-pink-500 flex items-center justify-center text-[8px] text-white font-bold">
                                ৳
                              </div>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                Bkash Payment Details
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 bg-pink-50/50 dark:bg-pink-900/10 p-4 rounded-xl border border-pink-100 dark:border-pink-900/30">
                              {invoice.bkashPaymentID && (
                                <div>
                                  <p className="text-xs text-pink-600/70 dark:text-pink-400/70 mb-1">
                                    Payment ID
                                  </p>
                                  <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 font-mono">
                                    {invoice.bkashPaymentID}
                                  </p>
                                </div>
                              )}
                              {invoice.bkashTrxID && (
                                <div>
                                  <p className="text-xs text-pink-600/70 dark:text-pink-400/70 mb-1">
                                    Transaction ID
                                  </p>
                                  <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 font-mono">
                                    {invoice.bkashTrxID}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs">
                                Created:{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {new Date(invoice.createdAt).toLocaleString()}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs">
                                Updated:{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {new Date(invoice.updatedAt).toLocaleString()}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1a1f26] border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Key className="h-4 w-4" />
              </div>
              Access Customer Account
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onPasswordSubmit)}
            className="p-6 space-y-6"
          >
            {/* Instructions Section */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Set a new password for{" "}
                <span className="font-bold">{user?.name}</span> to access their
                account.
              </p>
            </div>

            {/* Password Fields Section */}
            <div className="space-y-4">
              <TextField
                label="New Password"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                register={register}
                name="password"
                error={errors.password}
                autoComplete="new-password"
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <TextField
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                register={register}
                name="confirmPassword"
                error={errors.confirmPassword}
                autoComplete="new-password"
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <DialogFooter className="gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11 px-6 flex-1"
                onClick={() => {
                  reset();
                  setIsPasswordModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/20 border-0 h-11 px-6 flex-1 transition-all duration-300 hover:scale-[1.02]"
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminCustomerDetailPage;

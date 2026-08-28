import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Shield,
  Key,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Building,
  Power,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const AccountSettings = ({ user: userFromApi }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const user = userFromApi ?? null;
  const displayName = user?.name ?? "";
  const email = user?.email ?? "";
  const phone = user?.phone ?? "";
  const avatarUrl = user?.companyLogo ?? user?.photo ?? null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <Shield className="h-6 w-6" />
          </div>
          Account Security
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: User Identity */}
        <div className="xl:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden p-6 text-center relative group">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20"></div>

            <div className="relative z-10 mt-4 mb-4">
              <div className="w-40 h-40 mx-auto rounded-full border-4 border-white dark:border-[#1a1f26] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center overflow-hidden relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-4xl font-medium bg-gray-100 dark:bg-gray-800">
                    {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {displayName || "User"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {email || "No email provided"}
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Role
                </p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {user?.role || "Admin"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tip Card */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Secure Account</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  Use a strong password to protect your account. We recommend
                  rotating it every 90 days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details & Danger Zone */}
        <div className="xl:col-span-2 space-y-6">
          {/* Read-Only Details Card */}
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-violet-500" />
                Personal Information
              </h3>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="ml-1">
                    Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      value={displayName}
                      readOnly
                      className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="ml-1">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      value={email}
                      readOnly
                      className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="ml-1">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      value={phone}
                      readOnly
                      className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="ml-1">
                    Company
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyName"
                      value={user?.companyName ?? ""}
                      readOnly
                      className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Password (Masked) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password" className="ml-1">
                    Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      defaultValue="********"
                      readOnly
                      className="h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-[24px] border border-red-100 dark:border-red-900/30 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Deactivate Option */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Power className="w-4 h-4 text-gray-500" />
                    {isActive ? "Deactivate Account" : "Activate Account"}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isActive 
                      ? "Temporarily disable your account. You can reactivate it at any time."
                      : "Your account is currently disabled. Reactivate to restore access."}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowDeactivateModal(true)}
                  variant={isActive ? "outline" : "default"}
                  className={isActive ? "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                >
                  {isActive ? "Deactivate" : "Activate Account"}
                </Button>
              </div>

              {/* Delete Option */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 transition-all hover:border-red-200 dark:hover:border-red-900/50">
                <div className="space-y-1">
                  <h4 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">
                    Permanently remove your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate/Activate Modal */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isActive ? "Deactivate Account" : "Activate Account"}</DialogTitle>
            <DialogDescription>
              {isActive 
                ? "Are you sure you want to deactivate your account? You won't be able to access your data until you reactivate it."
                : "Are you sure you want to activate your account? You will regain access to all your data."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
            <Button 
              className={isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
              onClick={() => {
                setIsActive(!isActive);
                setShowDeactivateModal(false);
              }}
            >
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, including profile information and settings, will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                // Add delete logic here
                setShowDeleteModal(false);
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AccountSettings;

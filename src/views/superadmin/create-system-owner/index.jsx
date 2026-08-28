import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateSystemOwnerMutation } from "@/features/systemuser/systemuserApiSlice";

const createSystemOwnerSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please enter a valid phone number"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

const CreateSystemOwnerPage = () => {
  const navigate = useNavigate();
  const [createSystemOwner, { isLoading }] = useCreateSystemOwnerMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createSystemOwnerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await createSystemOwner(data).unwrap();
      if (res) {
        toast.success("System Owner created successfully");
        navigate("/manage-users");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create System Owner");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/superadmin/manage-users")}
              className="bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm rounded-xl h-10 w-10 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create System Owner</h1>
              <p className="text-violet-100 text-lg max-w-2xl">
                Create a new System Owner who can manage users and assign permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Personal Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Name *"
                placeholder="John Doe"
                register={register}
                name="name"
                error={errors.name}
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 dark:bg-slate-900/50"
              />

              <TextField
                label="Company Name *"
                placeholder="Company Inc."
                register={register}
                name="companyName"
                error={errors.companyName}
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 dark:bg-slate-900/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Email *"
                type="email"
                placeholder="owner@company.com"
                register={register}
                name="email"
                error={errors.email}
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 dark:bg-slate-900/50"
              />

              <TextField
                label="Phone *"
                placeholder="+123456789"
                register={register}
                name="phone"
                error={errors.phone}
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Security
              </h3>
            </div>
            
            <div className="max-w-md">
              <TextField
                label="Password *"
                type="password"
                placeholder="At least 6 characters"
                register={register}
                name="password"
                error={errors.password}
                inputClassName="h-14 rounded-xl border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/superadmin/manage-users")}
              disabled={isLoading}
              className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11 px-8 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 border-0 h-11 px-10 transition-all duration-300 hover:scale-[1.02]"
            >
              {isLoading ? "Creating..." : "Create System Owner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSystemOwnerPage;

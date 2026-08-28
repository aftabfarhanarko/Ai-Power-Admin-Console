import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const GeneralSettings = ({ user: userFromApi }) => {
  const authUser = useSelector((state) => state.auth.user);
  const user = userFromApi ?? authUser ?? null;
  const userId = authUser?.userId ?? authUser?.sub ?? authUser?.id;
  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      branchLocation: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        email: user.email ?? "",
        companyName: user.companyName ?? "",
        phone: user.phone ?? "",
        branchLocation: user.branchLocation ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!userId) {
      toast.error("User not found");
      return;
    }
    try {
      await updateSystemuser({ id: userId, ...data }).unwrap();
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to save");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500">
        No user data. Please sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Update your business details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Business / Company name</Label>
              <Input id="name" className="h-11" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" className="h-11" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" className="h-11" {...register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" className="h-11" {...register("phone")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="branchLocation">Branch / Location</Label>
              <Input id="branchLocation" className="h-11" {...register("branchLocation")} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;

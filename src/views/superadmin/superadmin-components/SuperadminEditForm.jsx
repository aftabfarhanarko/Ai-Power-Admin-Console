import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useUpdateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  designation: yup.string().nullable(),
  photo: yup.string().url("Must be a valid URL").nullable(),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .nullable(),
  confirmPassword: yup
    .string()
    .when("password", {
      is: (val) => val && val.length > 0,
      then: (schema) =>
        schema
          .required("Please confirm password")
          .oneOf([yup.ref("password")], "Passwords must match"),
      otherwise: (schema) => schema.nullable(),
    }),
  permissions: yup.array().of(yup.string()).nullable(),
});

const SuperadminEditForm = ({ superadmin, onClose }) => {
  const [updateSuperadmin, { isLoading }] = useUpdateSuperadminMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: superadmin?.name || "",
      designation: superadmin?.designation || "",
      photo: superadmin?.photo || "",
      password: "",
      confirmPassword: "",
      permissions: superadmin?.permissions || [],
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        designation: data.designation || null,
        photo: data.photo || null,
        permissions: data.permissions || [],
      };

      // Only include password if it's provided
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      await updateSuperadmin({
        id: superadmin.id,
        ...payload,
      }).unwrap();
      toast.success("Super admin updated successfully");
      reset();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update super admin");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Super Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            label="Name *"
            placeholder="Enter super admin name"
            register={register}
            name="name"
            error={errors.name}
          />

          <TextField
            label="Designation"
            placeholder="Enter designation (optional)"
            register={register}
            name="designation"
            error={errors.designation}
          />

          <TextField
            label="Photo URL"
            placeholder="Enter photo URL (optional)"
            register={register}
            name="photo"
            error={errors.photo}
          />

          <div className="space-y-2">
            <p className="text-sm text-black/60 dark:text-white/60">
              Leave password fields empty to keep current password
            </p>
            <TextField
              label="New Password"
              type="password"
              placeholder="Enter new password (optional)"
              register={register}
              name="password"
              error={errors.password}
            />

            <TextField
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              register={register}
              name="confirmPassword"
              error={errors.confirmPassword}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuperadminEditForm;

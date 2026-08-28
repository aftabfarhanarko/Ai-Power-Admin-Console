import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useCreateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
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
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email"),
  designation: yup.string().nullable(),
  photo: yup.string().url("Must be a valid URL").nullable(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  permissions: yup.array().of(yup.string()).nullable(),
});

const SuperadminCreateForm = ({ onClose }) => {
  const [createSuperadmin, { isLoading }] = useCreateSuperadminMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      designation: "",
      photo: "",
      password: "",
      confirmPassword: "",
      permissions: [],
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        designation: data.designation || null,
        photo: data.photo || null,
        password: data.password,
        permissions: data.permissions || [],
      };

      await createSuperadmin(payload).unwrap();
      toast.success("Super admin created successfully");
      reset();
      onClose();
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to create super admin"
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Super Admin</DialogTitle>
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
            label="Email *"
            type="email"
            placeholder="Enter email address"
            register={register}
            name="email"
            error={errors.email}
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

          <TextField
            label="Password *"
            type="password"
            placeholder="Enter password (min. 6 characters)"
            register={register}
            name="password"
            error={errors.password}
          />

          <TextField
            label="Confirm Password *"
            type="password"
            placeholder="Re-enter password"
            register={register}
            name="confirmPassword"
            error={errors.confirmPassword}
          />

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
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuperadminCreateForm;

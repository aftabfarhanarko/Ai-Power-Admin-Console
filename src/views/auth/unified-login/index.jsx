import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import AuthPage from "@/pages/auth";

// hooks and function
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { useLoginSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

// icons
import { letter, password } from "@/assets/icons/svgIcons";

const UnifiedLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSubmit, register } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [superadminLogin] = useSuperadminLoginMutation();
  const [loginSystemuser] = useLoginSystemuserMutation();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const loginCredential = data.email || data.name;

      // Try superadmin login first (uses name)
      try {
        const superadminResult = await superadminLogin({
          name: loginCredential,
          password: data.password,
        }).unwrap();

        if (superadminResult && superadminResult.accessToken) {
          // Decode token to check role
          const { payload } = decodeJWT(superadminResult.accessToken);

          if (payload.role === "SUPER_ADMIN") {
            dispatch(
              superadminLoggedIn({
                accessToken: superadminResult.accessToken,
                refreshToken: superadminResult.refreshToken || null,
                user: superadminResult.user || null,
              }),
            );
            toast.success("Super Admin Login Successful!");
            navigate("/superadmin");
            setIsLoading(false);
            return;
          }
        }
      } catch (superadminError) {
        // Superadmin login failed, try systemuser login
        // This is expected if user is not a superadmin
      }

      // Try systemuser login (uses email)
      const systemuserResult = await loginSystemuser({
        email: loginCredential,
        password: data.password,
      });

      if (systemuserResult?.data) {
        const responseData = systemuserResult.data;
        const accessToken =
          responseData?.accessToken || responseData?.data?.accessToken;
        const refreshToken =
          responseData?.refreshToken || responseData?.data?.refreshToken;

        if (!accessToken) {
          toast.error("Login failed: Access token is missing.");
          setIsLoading(false);
          return;
        }

        // Decode token to check role
        const { payload } = decodeJWT(accessToken);
        const userRole = payload.role || responseData?.user?.role;

        // Check if user is SYSTEM_OWNER or EMPLOYEE
        if (userRole === "SYSTEM_OWNER" || userRole === "EMPLOYEE") {
          dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
          toast.success("Login Successful!");
          navigate("/");
        } else {
          toast.error("Invalid user role. Access denied.");
        }
      } else if (systemuserResult?.error) {
        toast.error(
          systemuserResult?.error?.data?.message ||
            systemuserResult?.error?.message ||
            "Invalid email or password!",
        );
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Invalid credentials!";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.data?.message) {
        errorMessage = error.error.data.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title="Login"
      subtitle="Enter your credentials to access your dashboard"
    >
      <>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-8"
        >
          <TextField
            placeholder="Your Email or Name"
            type="text"
            register={register}
            name="email"
            icon={letter}
            disabled={isLoading}
            required
          />
          <TextField
            placeholder="Type your Password"
            register={register}
            name="password"
            type="password"
            icon={password}
            disabled={isLoading}
            required
          />

          <SubmitButton
            isLoading={isLoading}
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? "Logging In..." : "Login"}
          </SubmitButton>
        </form>
      </>
    </AuthPage>
  );
};

export default UnifiedLoginPage;
import React from "react";
import { Link } from "react-router-dom";
import AuthPage from "..";
import { CheckCircle } from "lucide-react";

const CheckEmailPage = () => {
  return (
    <AuthPage title="Verify Your Email">
      <>
        <p className="text-sm text-center text-black/40 dark:text-white/50">
          Verify with your Email Address
        </p>
        <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl mt-5">
          <CheckCircle className="text-green-600" />
          <p className="my-3 dark:text-white/80">
            An Email has sent to your account. Please Complete your Registration
            from your Email
          </p>
        </div>

        <p className="mt-16 text-sm text-center text-black/40 dark:text-white/50">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary">
            Sign In
          </Link>
        </p>
      </>
    </AuthPage>
  );
};

export default CheckEmailPage;
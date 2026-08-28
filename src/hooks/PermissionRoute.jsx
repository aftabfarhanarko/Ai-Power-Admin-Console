import { Navigate, useLocation } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission } from "@/constants/feature-permission";
import AtomLoader from "@/components/loader/AtomLoader";
import { Lock } from "lucide-react";

const PermissionRoute = ({ children, permission, redirectTo = "/login" }) => {
  const location = useLocation();
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  if (!permission) return children;

  // Show loader while fetching user data
  if (isLoadingUser) {
    return (
      <div className="h-screen w-screen center">
        <AtomLoader />
      </div>
    );
  }

  // If user fetch failed or user is missing (e.g. backend down), redirect to login
  // if (!user) {
  // return <Navigate state={{ from: location }} to="/login" replace />;
  // }

  const allowed = hasPermission(user, permission);

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Access Denied</h2>
        <p className="text-[var(--muted-text)] max-w-md">
          You do not have the <span className="font-semibold text-[var(--foreground)]">{permission}</span> permission to view this page. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return children;
};

export default PermissionRoute;

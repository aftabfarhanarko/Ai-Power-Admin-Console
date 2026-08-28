import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "@/hooks/useAuth";
import AtomLoader from "@/components/loader/AtomLoader";

const PrivateRoute = ({ children, redirectTo = "/login" }) => {
  const location = useLocation();
  const { isLoading, authChecked } = useAuth();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!authChecked || isLoading) {
    return (
      <div className="h-screen w-screen center">
        <AtomLoader />
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate state={{ from: location }} to={redirectTo} replace />
  );
};

export default PrivateRoute;

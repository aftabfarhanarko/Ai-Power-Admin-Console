import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { userDetailsFetched, userLoggedOut } from "@/features/auth/authSlice";
import { APP_TITLE } from "@/config/appMode";

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  const { data, isSuccess, isLoading, isError, refetch } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthChecked(true);
      // Reset document title when not authenticated
      document.title = APP_TITLE;
      return;
    }

    // Show loading state while fetching user data
    if (isLoading) {
      document.title = `Loading... - ${APP_TITLE}`;
      return;
    }

    // Set authChecked to true when authenticated
    setAuthChecked(true);

    if (isSuccess && data) {
      // Store user details in Redux
      dispatch(userDetailsFetched(data));
      
      // Update document title with company name and company ID from API
      const companyName = data.companyName || APP_TITLE;
      const companyId = data.companyId || "";
      
      if (companyId) {
        document.title = `${companyName} (${companyId}) - ${APP_TITLE}`;
      } else {
        document.title = `${companyName} - ${APP_TITLE}`;
      }
    } else if (isError) {
      // Clear token and redirect to login if profile fetch fails
      dispatch(userLoggedOut());
    }
  }, [
    isSuccess,
    isError,
    data,
    dispatch,
    isAuthenticated,
    isLoading,
  ]);

  return {
    isLoading: isLoading || (isAuthenticated && !authChecked),
    authChecked,
    refetchProfile: refetch,
  };
};

export default useAuth;

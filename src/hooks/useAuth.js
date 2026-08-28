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
      document.title = APP_TITLE;
      return;
    }

    if (!isLoading) {
      setAuthChecked(true);
    }

    if (isSuccess && data) {
      dispatch(userDetailsFetched(data));
      
      const companyName = data.companyName || APP_TITLE;
      const companyId = data.companyId || "";
      
      if (companyId) {
        document.title = `${companyName} (${companyId}) - ${APP_TITLE}`;
      } else {
        document.title = `${companyName} - ${APP_TITLE}`;
      }
    } else if (isError) {
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
    isLoading,
    authChecked: !isAuthenticated || authChecked,
    refetchProfile: refetch,
  };
};

export default useAuth;

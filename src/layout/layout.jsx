import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideNav from "@/components/navbar/SideNav";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { useSearch } from "@/contexts/SearchContext";

const Layout = () => {
  const dispatch = useDispatch();
  const { isSearching } = useSearch();
  const navigate = useNavigate();
  const { isAuthenticated: isSuperAdmin } = useSelector((state) => state.superadminAuth);

  // Fetch user data at layout level so it's cached and available to all child components
  const { data: user } = useGetCurrentUserQuery();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Update Redux state when user data is fetched (for backward compatibility)
  // Also handle superadmin redirection if they land in merchant layout
  React.useEffect(() => {
    const isImpersonating = typeof window !== 'undefined' && sessionStorage.getItem("isImpersonating") === "true";
    const sessionSuperadminToken = typeof window !== 'undefined' && sessionStorage.getItem("superadmin_accessToken");
    
    // Only redirect if superadmin token actually exists in session and user is not impersonating
    if (isSuperAdmin && sessionSuperadminToken && !isImpersonating) {
      navigate("/superadmin", { replace: true });
      return;
    }

    if (user) {
      dispatch(userDetailsFetched(user));
    }
  }, [user, dispatch, isSuperAdmin, navigate]);

  const isImpersonating = typeof window !== 'undefined' && sessionStorage.getItem("isImpersonating") === "true";

  const handleStopImpersonation = () => {
    sessionStorage.removeItem("isImpersonating");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "/superadmin/customers";
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300">
      {isImpersonating && (
        <div className="w-full bg-[#3525cd] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-3 relative z-50">
          <span>You are currently impersonating <strong>{user?.companyName || user?.name || 'Merchant'}</strong></span>
          <button 
            onClick={handleStopImpersonation}
            className="px-3 py-1 bg-white text-[#3525cd] rounded-full text-[10px] font-bold hover:bg-white/90 active:scale-95 transition-all border-none cursor-pointer"
          >
            Exit Impersonation
          </button>
        </div>
      )}
      <div className="flex-1 flex min-h-0 w-full">
        {/* Sidebar - Fixed on detailed, hidden on mobile */}
        <SideNav
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
          {/* Top Navbar - Sticky */}
          <div className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#09090b]/80 border-b border-gray-200/50 dark:border-white/5 supports-[backdrop-filter]:bg-white/60">
            <TopNavbar setIsMobileMenuOpen={setIsMobileMenuOpen} />
          </div>

        {/* Page Content */}
        {!isSearching && (
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-[1600px] w-full mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <Outlet />
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
};

export default Layout;

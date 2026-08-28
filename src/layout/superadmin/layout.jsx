import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SuperAdminTopNavbar from "@/components/navbar/superadmin/SuperAdminTopNavbar";
import SuperAdminSideNav from "@/components/navbar/superadmin/SuperAdminSideNav";

/**
 * Super Admin Layout
 * - Separate layout wrapper for all /superadmin routes
 * - Own sidebar + top navbar, independent from the main admin layout
 */
const SuperAdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isEnterpriseLightShell =
    location.pathname === "/superadmin" ||
    location.pathname.startsWith("/superadmin/customers") ||
    location.pathname.startsWith("/superadmin/earnings") ||
    location.pathname.startsWith("/superadmin/packages") ||
    location.pathname.startsWith("/superadmin/superadmins") ||
    location.pathname.startsWith("/superadmin/profile") ||
    location.pathname.startsWith("/superadmin/invoices") ||
    location.pathname.startsWith("/superadmin/themes") ||
    location.pathname.startsWith("/superadmin/usage") ||
    location.pathname.startsWith("/superadmin/support") ||
    location.pathname.startsWith("/superadmin/status") ||
    location.pathname.startsWith("/superadmin/security") ||
    location.pathname.startsWith("/superadmin/website-management");

  return (
    <main
      className={`min-h-screen w-full flex transition-colors duration-300 ${
        isEnterpriseLightShell
          ? "bg-[#f8f9fc] text-[#1b1b24]"
          : "bg-[#05070a] text-[#eaf1ff]"
      }`}
      style={{
        fontFamily: isEnterpriseLightShell
          ? '"Plus Jakarta Sans", sans-serif'
          : '"Hanken Grotesk", sans-serif',
      }}
    >
      {/* Sidebar */}
      <SuperAdminSideNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        variant={isEnterpriseLightShell ? "enterprise" : "dark"}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
        {/* Top Navbar */}
        <SuperAdminTopNavbar
          variant={isEnterpriseLightShell ? "enterprise" : "dark"}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Page Content */}
        <div
          className={`flex-1 overflow-x-hidden w-full mx-auto ${
            isEnterpriseLightShell
              ? "px-8 py-6"
              : "px-4 py-4 lg:px-8 lg:py-6"
          }`}
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SuperAdminLayout;


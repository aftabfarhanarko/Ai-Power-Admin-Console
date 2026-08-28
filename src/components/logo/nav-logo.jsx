import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export const NavLogo = () => {
  const user = useSelector((state) => state.auth.user);
  const logo = user?.companyLogo;
  const companyName = user?.companyName || "SquadCart";

  return (
    <Link
      to={"/"}
      className={`lg:h-[60px] lg:w-[150px] lg:bg-gray-50 dark:bg-[#1a1f26] lg:dark:bg-white/5 dark:hover:bg-white/10 hover:bg-gray-100 tr rounded-full center`}
    >
      {logo && <img src={logo} alt={companyName} className="h-6" />}
    </Link>
  );
};

export const FooterLogo = () => {
  const user = useSelector((state) => state.auth.user);
  const logo = user?.companyLogo;
  const companyName = user?.companyName || "SquadCart";

  return (
    <Link to={"/"} className={``}>
      {logo && <img src={logo} alt={companyName} className="h-6" />}
    </Link>
  );
};

export default NavLogo;

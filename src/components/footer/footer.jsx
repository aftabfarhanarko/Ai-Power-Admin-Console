import React from "react";
import { Link } from "react-router-dom";

import { FooterLogo } from "../logo/nav-logo";

import { FOOTER_TEXT, footerNavLinks } from "./data";

const Footer = () => {
  return (
    <footer className="dark:bg-[#1a1f26] bg-white rounded-2xl pt-5 p-8 mt-5">
      <div className="flbx lg:flex-row flex-col lg:items-center items-start py-5 gap-4">
        <FooterLogo />
        <div className="fl lg:gap-10 gap-x-6 gap-y-2 flex-wrap">
          {footerNavLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="hover:text-primary tr lg:text-base text-sm font-medium"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
      <p className="lg:text-sm text-xs mt-1 text-black/50 dark:text-white/50">
        {FOOTER_TEXT}
      </p>
    </footer>
  );
};

export default Footer;

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useTranslation } from "react-i18next";

import { AlignLeft } from "lucide-react";
import { navSections } from "./data";
import { hasPermission } from "@/constants/feature-permission";

const SidebarMenu = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  const handleSideMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Wait for user so employee role gets correct permission filtering (avoid showing all nav while loading)
  const visibleNavSections =
    isLoadingUser || !user
      ? []
      : navSections
    .map((section) => {
      if (section.link) {
        if (hasPermission(user, section.permission)) return section;
        return null;
      }
      return {
        ...section,
        items: section.items
          .filter(
            (item) =>
              hasPermission(user, item.permission) ||
              (item?.children?.length &&
                item.children.some((child) => hasPermission(user, child.permission)))
          )
          .map((item) => ({
            ...item,
            children: item?.children?.filter((child) =>
              hasPermission(user, child.permission)
            ),
          }))
          .filter((item) => (item.children?.length ? item.children.length > 0 : true)),
      };
    })
    .filter((section) => section && (section.link || section.items.length > 0));

  return (
    <div>
      <button
        onClick={handleSideMenu}
        className="h-12 w-12 rounded-full bg-gray-50 dark:bg-[#1a1f26] center"
      >
        <AlignLeft className="h-5" />
      </button>

      <div
        className={`fixed bg-black/50 backdrop-blur-sm tr ${isOpen ? "z-40 opacity-100 inset-0" : "z-[-10] opacity-0"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`h-screen w-[300px] bg-white dark:bg-[#202020] z-50 fixed top-0 left-0 tr overflow-hidden p-8 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-6">
          {visibleNavSections?.map((section, sectionIndex) => (
            section.link ? (
               <Link 
                  key={section.id} 
                  to={section.link}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-primary tr"
               >
                  {section.icon && <section.icon className="h-5 w-5" />}
                  {section.tKey ? t(section.tKey) : section.title}
               </Link>
            ) : (
            <div key={section.id} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                {section.tKey ? t(section.tKey) : section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.items.map((item, itemIndex) => (
                  <li key={item.id || itemIndex}>
                    <Link
                      onClick={() => setIsOpen(false)}
                      to={item?.link}
                      className="w-fit hover:text-primary tr block"
                    >
                      {item.tKey ? t(item.tKey) : item.title}
                    </Link>
                    {item?.children && item.children.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {item.children.map((subitem, subIndex) => (
                          <Link
                            to={subitem.link}
                            key={subIndex}
                            onClick={() => setIsOpen(false)}
                            className="text-sm ml-4 w-fit hover:text-primary tr"
                          >
                            {subitem.tKey ? t(subitem.tKey) : subitem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;

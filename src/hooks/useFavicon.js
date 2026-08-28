import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * Custom hook to dynamically update favicon from API
 * Uses the company logo from the authenticated user's data
 */
const useFavicon = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Get the logo URL from user data
    const logoUrl = user?.companyLogo;

    if (!logoUrl) return;

    // Find existing favicon link or create new one
    let favicon = document.querySelector("link[rel='icon']");
    
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    // Update favicon href with the logo from API
    favicon.href = logoUrl;
    
    // Update type based on the logo format
    if (logoUrl.endsWith('.svg')) {
      favicon.type = "image/svg+xml";
    } else if (logoUrl.endsWith('.png')) {
      favicon.type = "image/png";
    } else if (logoUrl.endsWith('.ico')) {
      favicon.type = "image/x-icon";
    } else if (logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg')) {
      favicon.type = "image/jpeg";
    } else {
      favicon.type = "image/png"; // default
    }
  }, [user?.companyLogo]);
};

export default useFavicon;

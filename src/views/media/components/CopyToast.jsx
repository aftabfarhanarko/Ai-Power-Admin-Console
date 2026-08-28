import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Toast notification for copy-to-clipboard feedback
 */
export default function CopyToast({ show }) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[60] bg-gray-900 text-white dark:bg-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
        >
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold">{t("media.copiedToClipboard")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

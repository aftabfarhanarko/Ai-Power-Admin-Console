"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-indigo-950/40 pointer-events-none" />
      <div className="relative z-10 text-center max-w-md mx-auto glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

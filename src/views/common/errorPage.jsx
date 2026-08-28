import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const ErrorPage = () => {
  // Parallax effect
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX / width - 0.5) * 2;
    const yPct = (clientY / height - 0.5) * 2;
    x.set(xPct);
    y.set(yPct);
  };

  // Transform values for different layers
  const textX = useTransform(dx, [-1, 1], [-20, 20]);
  const textY = useTransform(dy, [-1, 1], [-20, 20]);
  
  const cloud1X = useTransform(dx, [-1, 1], [30, -30]);
  const cloud1Y = useTransform(dy, [-1, 1], [30, -30]);
  
  const cloud2X = useTransform(dx, [-1, 1], [-40, 40]);
  const cloud2Y = useTransform(dy, [-1, 1], [-20, 20]);

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-white relative overflow-hidden font-sans selection:bg-indigo-100 flex flex-col"
    >
      {/* Minimal Header - Logo Only */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 p-6 lg:p-8 z-50"
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
            <ShoppingCart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            SquadCart
          </span>
        </Link>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-[1400px] mx-auto pt-16 sm:pt-20">
        {/* 404 Text Wrapper */}
        <div className="relative w-full flex justify-center items-center py-6 sm:py-10 lg:py-0 perspective-1000">
          {/* Huge 404 Text with Parallax */}
          <motion.h1 
            style={{ x: textX, y: textY }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[120px] xs:text-[150px] sm:text-[280px] lg:text-[400px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-indigo-600 to-indigo-200 select-none opacity-100 drop-shadow-sm"
          >
            404
          </motion.h1>

          {/* Cloud/Fog Overlay Effects - Layered for depth */}
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
            {/* Cloud 1 (Left) */}
            <motion.div 
              style={{ x: cloud1X, y: cloud1Y }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] left-[5%] lg:left-[20%] w-32 sm:w-64 h-16 sm:h-32 bg-indigo-50/80 blur-2xl rounded-full mix-blend-multiply"
            />
            {/* Cloud 2 (Right) */}
            <motion.div 
              style={{ x: cloud2X, y: cloud2Y }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30%] right-[5%] lg:right-[20%] w-40 sm:w-72 h-20 sm:h-40 bg-purple-50/60 blur-3xl rounded-full mix-blend-multiply"
            />
          </div>
        </div>

        {/* Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-20 mt-[-40px] xs:mt-[-50px] sm:mt-[-80px] lg:mt-[-120px] space-y-6 px-4 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
            Page not found
          </h2>
          <p className="text-slate-600 text-base sm:text-lg lg:text-xl px-4">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Search Bar - Premium Feature */}
          <div className="relative max-w-md mx-auto mt-6 sm:mt-8 group w-full px-4 sm:px-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-xl shadow-indigo-100 border border-slate-100 overflow-hidden p-1">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Search for pages..." 
                className="w-full px-4 py-3 outline-none text-slate-600 placeholder:text-slate-400 bg-transparent text-sm sm:text-base"
              />
              <button className="bg-slate-900 hover:bg-indigo-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-slate-700 border border-slate-200 text-sm font-semibold rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </main>

      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle clouds on edges */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-50/50 to-blue-50/30 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-purple-50/50 to-pink-50/30 rounded-full blur-[130px] translate-x-1/3 translate-y-1/3"
        />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>
    </div>
  );
};

export default ErrorPage;

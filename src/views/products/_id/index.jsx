import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Pencil, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Tag, 
  Layers, 
  AlertTriangle,
  CheckCircle2,
  Box,
  BarChart3
} from "lucide-react";
import { useGetProductQuery } from "@/features/product/productApiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ProductViewPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: product, isLoading } = useGetProductQuery(parseInt(id));

  const renderPrice = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">{t("products.loadingProductDetails")}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14] p-6">
        <div className="text-center max-w-md">
          <Box className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("products.productNotFound")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{t("products.productNotFoundDesc")}</p>
          <Button onClick={() => navigate("/products")} className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            <ArrowLeft className="mr-2 h-5 w-5" />
            {t("productForm.backToProducts")}
          </Button>
        </div>
      </div>
    );
  }

  const cleanThumbnail = product.thumbnail?.replace(/`/g, "").trim();
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0] || { url: cleanThumbnail };
  const otherImages = product.images?.filter((img) => img.id !== primaryImage?.id) || [];
  
  // Calculate stock status color/text
  const isLowStock = (product.stock || 0) <= 5;
  const isOutOfStock = (product.stock || 0) === 0;
  
  const stats = [
    {
      label: t("productForm.stockLevel"),
      value: product.stock || 0,
      subValue: isOutOfStock ? t("products.outOfStock") : isLowStock ? t("products.lowStock") : t("products.inStock"),
      icon: Package,
      color: isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-emerald-600",
      bg: isOutOfStock ? "bg-red-50 dark:bg-red-900/20" : isLowStock ? "bg-orange-50 dark:bg-orange-900/20" : "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: t("productForm.totalSold"),
      value: product.sold || 0,
      subValue: t("productForm.lifetimeSales"),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("productForm.totalRevenue"),
      value: renderPrice(product.totalIncome),
      subValue: t("productForm.grossIncome"),
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14] p-6 lg:p-10 font-sans">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10"
      >
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/products")}
            className="pl-0 hover:bg-transparent text-gray-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("productForm.backToInventory")}
          </Button>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">{t("productForm.productDetails")}</span>
          </h1>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
             <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" /> {product.category?.name || t("productForm.uncategorized")}
             </span>
             <span>•</span>
             <span className="uppercase tracking-wider">{t("products.sku")}: {product.sku || t("common.na")}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("productForm.editProduct")}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden"
          >
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                {/* Decorative background icon */}
                <stat.icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-5 ${stat.color}`} />
             </div>
             <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.subValue}</p>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left Column: Images */}
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
         >
            <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-2 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
               <div className="aspect-square rounded-[20px] overflow-hidden bg-gray-100 dark:bg-black/20 relative group">
                  {primaryImage?.url ? (
                     <img 
                        src={primaryImage.url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Box className="w-20 h-20" />
                     </div>
                  )}
                  {product.discountPrice && (
                     <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {t("productForm.sale")}
                     </div>
                  )}
               </div>
            </div>

            {/* Thumbnails */}
            {otherImages.length > 0 && (
               <div className="grid grid-cols-4 gap-4">
                  {otherImages.map((img, idx) => (
                     <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] p-1 cursor-pointer hover:border-indigo-500 transition-colors">
                        <img 
                           src={img.url} 
                           alt={`Product ${idx}`} 
                           className="w-full h-full object-cover rounded-xl"
                        />
                     </div>
                  ))}
               </div>
            )}
         </motion.div>

         {/* Right Column: Details */}
         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 space-y-8"
         >
            {/* Main Info Card */}
            <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                     <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`
                           ${product.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700"}
                           px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                        `}>
                           {product.isActive ? t("productForm.active") : t("productForm.inactive")}
                        </Badge>
                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-500">
                           {product.status}
                        </Badge>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {renderPrice(product.discountPrice || product.price)}
                     </p>
                     {product.discountPrice && (
                        <p className="text-gray-400 line-through font-medium text-lg">
                           {renderPrice(product.price)}
                        </p>
                     )}
                  </div>
               </div>

               <Separator className="my-6 bg-gray-100 dark:bg-gray-800" />

               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Layers className="w-5 h-5 text-indigo-500" />
                     {t("productForm.description")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                     {product.description || t("productForm.noDescriptionAvailable")}
                  </p>
               </div>
            </div>

            {/* Inventory & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Inventory Card */}
               <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Box className="w-5 h-5 text-indigo-500" />
                     {t("productForm.inventoryDetails")}
                  </h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.stockStatus")}</span>
                        <span className={`font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-emerald-600"}`}>
                           {isOutOfStock ? t("products.outOfStock") : isLowStock ? t("products.lowStock") : t("products.inStock")}
                        </span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.quantity")}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{product.stock || 0} {t("productForm.units")}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.lowStockLimit")}</span>
                        <span className="font-bold text-gray-900 dark:text-white">5 {t("productForm.units")}</span>
                     </div>
                  </div>
               </div>

               {/* Pricing Card */}
               <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Tag className="w-5 h-5 text-indigo-500" />
                     {t("productForm.pricingInfo")}
                  </h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.regularPrice")}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{renderPrice(product.price)}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.discountPrice")}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{product.discountPrice ? renderPrice(product.discountPrice) : "—"}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <span className="text-gray-500 font-medium">{t("productForm.profitMargin")}</span>
                        <span className="font-bold text-emerald-600">
                           {product.costPrice ? `${Math.round(((product.price - product.costPrice) / product.price) * 100)}%` : "—"}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

         </motion.div>
      </div>
    </div>
  );
};

export default ProductViewPage;

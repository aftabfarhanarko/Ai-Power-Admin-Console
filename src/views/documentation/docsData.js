import { 
  Rocket, 
  Box, 
  ShoppingCart, 
  Truck, 
  Megaphone, 
  Settings, 
  BarChart3,
  HelpCircle,
  CreditCard,
  ShieldCheck,
  Globe
} from "lucide-react";

export const DOCS_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to SquadCart? Start here to set up your store in minutes.",
    icon: Rocket,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    articles: [
      {
        id: "setup-guide",
        title: "Store Setup Guide",
        content: `
          # Welcome to SquadCart!
          Setting up your store is easy. Follow these simple steps:
          
          1. **Complete your Profile**: Go to Settings > Profile and add your business details.
          2. **Configure your Domain**: If you have a custom domain, set it up in Settings > Custom Domain.
          3. **Add your first Product**: Head over to the Products menu and click "New Product".
          4. **Set up Payments**: Choose your preferred payment methods to start receiving money.
        `
      },
      {
        id: "dashboard-overview",
        title: "Understanding your Dashboard",
        content: `
          # Your Dashboard at a Glance
          The dashboard gives you a bird's eye view of your business:
          
          - **Total Revenue**: Total money earned this month.
          - **Total Orders**: Number of orders placed by customers.
          - **Total Visitors**: Real-time traffic on your storefront.
          - **Recent Activity**: A list of the latest actions taken in your store.
        `
      }
    ]
  },
  {
    id: "inventory",
    title: "Inventory Management",
    description: "Learn how to manage your products, categories, and stock levels.",
    icon: Box,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    articles: [
      {
        id: "adding-products",
        title: "Adding and Managing Products",
        content: `
          # Managing your Products
          Your products are the heart of your store.
          
          ### How to add a product:
          1. Go to **Inventory Management > Product**.
          2. Click the **+ New Product** button.
          3. Upload high-quality images.
          4. Set a price and description.
          5. Click **Save**.
          
          ### Pro Tip:
          Use **Bulk Upload** if you have many products. You can download our Excel template, fill it in, and upload it all at once!
        `
      },
      {
        id: "categories-stock",
        title: "Categories and Stock Control",
        content: `
          # Organizing your Store
          
          ### Categories
          Create categories to help customers find products easily (e.g., "Men's Wear", "Beauty Products").
          
          ### Inventory
          Keep track of your stock levels in the **Inventory** menu. SquadCart will automatically reduce stock when a customer makes a purchase.
        `
      }
    ]
  },
  {
    id: "orders",
    title: "Order Processing",
    description: "Manage orders, generate invoices, and track high-risk transactions.",
    icon: ShoppingCart,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    articles: [
      {
        id: "processing-orders",
        title: "How to Process an Order",
        content: `
          # Order Workflow
          When a customer places an order, it will appear in **Order Management > Order**.
          
          1. **Review Order**: Check the items and customer details.
          2. **Generate Invoice**: Click "Create Invoice" to send a professional PDF invoice to your customer.
          3. **Update Status**: Set the status to "Processing" or "Shipped" as you fulfill the items.
          4. **Track Shipping**: Use our integrated couriers for real-time tracking.
        `
      },
    ]
  },
  {
    id: "courier",
    title: "Courier Integration",
    description: "Connect with Steadfast, Pathao, and RedX for seamless shipping.",
    icon: Truck,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    articles: [
      {
        id: "setup-courier",
        title: "Connecting your Couriers",
        content: `
          # Shipping Automation
          Stop manual booking! Connect your courier accounts directly.
          
          1. Go to **Settings > Courier Integration**.
          2. Enter your API Keys (Secret Key/Token) from Steadfast, Pathao, or RedX.
          3. Once connected, you can "Book Courier" directly from any order page with one click.
        `
      }
    ]
  },
  {
    id: "marketing",
    title: "Marketing & Growth",
    description: "Use banners and promocodes to attract more customers.",
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    articles: [
      {
        id: "promocodes",
        title: "Creating Discounts",
        content: `
          # Boost your Sales
          Everyone loves a discount! Create promocodes in **Marketing > Promocodes**.
          
          - **Type**: Choose between "Percentage" or "Fixed Amount" off.
          - **Duration**: Set start and end dates for your sale.
          - **Limits**: Control how many times a code can be used.
        `
      }
    ]
  },
  {
    id: "usage",
    title: "Usage & Plan Limits",
    description: "Learn about your package limits and how to upgrade.",
    icon: BarChart3,
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    articles: [
      {
        id: "tracking-usage",
        title: "Monitoring your Limits",
        content: `
          # Understanding your Plan
          Each SquadCart package comes with specific limits (e.g., how many visitors you can have per month).
          
          - **Visitor Count**: Reset monthly. High traffic stores may need to upgrade.
          - **Product Limit**: The maximum number of products you can list.
          - **Staff Limit**: How many team members can access your dashboard.
          
          Go to the **Usage** menu to see your real-time consumption.
        `
      }
    ]
  }
];

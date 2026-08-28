import { useMemo } from "react";

const useOrdersFilters = (orders, activeTab, searchQuery, sortBy, sortOrder, dateRange) => {
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Tab filtering based on order status
    if (activeTab === "Pending") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "pending",
      );
    } else if (activeTab === "Processing") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "processing",
      );
    } else if (activeTab === "Paid") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "paid",
      );
    } else if (activeTab === "Shipped") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "shipped",
      );
    } else if (activeTab === "Delivered") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "delivered",
      );
    } else if (activeTab === "Cancelled") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "cancelled",
      );
    } else if (activeTab === "Refunded") {
      result = result.filter(
        (o) => (o.status?.toLowerCase() || "") === "refunded",
      );
    } else if (activeTab === "Unpaid") {
      result = result.filter((o) => !o.isPaid);
    }

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const orderId = String(o.id || "").toLowerCase();
        const customerName = (o.customer?.name || o.customerName || "").toLowerCase();
        const customerPhone = (o.customer?.phone || o.customerPhone || "").toLowerCase();
        const customerEmail = (o.customer?.email || o.customerEmail || "").toLowerCase();
        const trackingId = (o.shippingTrackingId || "").toLowerCase();
        
        return (
          orderId.includes(query) ||
          customerName.includes(query) ||
          customerPhone.includes(query) ||
          customerEmail.includes(query) ||
          trackingId.includes(query)
        );
      });
    }

    // Date range filtering
    if (dateRange.start || dateRange.end) {
      result = result.filter((o) => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt).getTime();
        const startTime = dateRange.start ? new Date(dateRange.start).setHours(0, 0, 0, 0) : 0;
        const endTime = dateRange.end ? new Date(dateRange.end).setHours(23, 59, 59, 999) : Date.now();
        return orderDate >= startTime && orderDate <= endTime;
      });
    }

    // Sorting
    const sorted = [...result].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateB - dateA;
      } else if (sortBy === "amount") {
        const amountA = Number(a.totalAmount || 0);
        const amountB = Number(b.totalAmount || 0);
        comparison = amountB - amountA;
      } else if (sortBy === "status") {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();
        comparison = statusA.localeCompare(statusB);
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
    });

    return sorted;
  }, [orders, activeTab, searchQuery, sortBy, sortOrder, dateRange]);

  return filteredOrders;
};

export default useOrdersFilters;

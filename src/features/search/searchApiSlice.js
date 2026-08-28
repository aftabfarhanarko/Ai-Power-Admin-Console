import { apiSlice } from "../api/apiSlice";
import { useGetOrdersQuery } from "../order/orderApiSlice";
import { useGetProductsQuery } from "../product/productApiSlice";
import { useGetUsersQuery } from "../user/userApiSlice";

// Global search hook that combines results from multiple APIs
export const useGlobalSearch = (searchTerm, companyId) => {
  const { data: orders = [], isLoading: isLoadingOrders } = useGetOrdersQuery(
    { companyId },
    { skip: !companyId || !searchTerm || searchTerm.trim().length < 2 }
  );
  
  const { data: products = [], isLoading: isLoadingProducts } = useGetProductsQuery(
    { companyId },
    { skip: !companyId || !searchTerm || searchTerm.trim().length < 2 }
  );
  
  const { data: customers = [], isLoading: isLoadingCustomers } = useGetUsersQuery(
    { companyId },
    { skip: !companyId || !searchTerm || searchTerm.trim().length < 2 }
  );

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingCustomers;

  // Filter results based on search term
  const filteredResults = {
    orders: [],
    products: [],
    customers: [],
  };

  if (searchTerm && searchTerm.trim().length >= 2) {
    const searchLower = searchTerm.toLowerCase().trim();

    // Filter orders
    filteredResults.orders = orders.filter((order) => {
      const idMatch = String(order.id || "").toLowerCase().includes(searchLower);
      const customerNameMatch = order.customer?.name?.toLowerCase().includes(searchLower);
      const customerEmailMatch = order.customer?.email?.toLowerCase().includes(searchLower);
      const statusMatch = order.status?.toLowerCase().includes(searchLower);
      const totalMatch = String(order.totalAmount || order.total || "").includes(searchLower);
      return idMatch || customerNameMatch || customerEmailMatch || statusMatch || totalMatch;
    });

    // Filter products
    filteredResults.products = products.filter((product) => {
      const nameMatch = product.name?.toLowerCase().includes(searchLower);
      const skuMatch = product.sku?.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const idMatch = String(product.id || "").toLowerCase().includes(searchLower);
      return nameMatch || skuMatch || descriptionMatch || idMatch;
    });

    // Filter customers
    filteredResults.customers = customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(searchLower);
      const emailMatch = customer.email?.toLowerCase().includes(searchLower);
      const phoneMatch = customer.phone?.toLowerCase().includes(searchLower);
      const idMatch = String(customer.id || "").toLowerCase().includes(searchLower);
      return nameMatch || emailMatch || phoneMatch || idMatch;
    });
  }

  const totalResults = 
    filteredResults.orders.length + 
    filteredResults.products.length + 
    filteredResults.customers.length;

  return {
    results: filteredResults,
    isLoading,
    totalResults,
  };
};

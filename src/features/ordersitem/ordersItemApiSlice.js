import { apiSlice } from "../api/apiSlice";

export const ordersItemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Flatten all items from all orders
    getOrderItems: builder.query({
      query: (params) => ({ url: "/orders", method: "GET", params }),
      transformResponse: (res) => {
        const orders = res?.data ?? [];
        return orders.flatMap((o) =>
          (o.items ?? []).map((it) => ({
            orderId: o.id,
            productName: it?.product?.name ?? "-",
            sku: it?.product?.sku ?? "-",
            quantity: it?.quantity ?? 0,
            unitPrice: it?.unitPrice ?? 0,
            totalPrice: it?.totalPrice ?? 0,
            orderStatus: o?.status ?? "-",
            createdAt: o?.createdAt ?? null,
          }))
        );
      },
      providesTags: [
        { type: "orders", id: "LIST" },
      ],
    }),

    // Flatten items for a single order by id
    getOrderItemsByOrderId: builder.query({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      transformResponse: (res) => {
        const o = res?.data;
        if (!o) return [];
        return (o.items ?? []).map((it) => ({
          orderId: o.id,
          productName: it?.product?.name ?? "-",
          sku: it?.product?.sku ?? "-",
          quantity: it?.quantity ?? 0,
          unitPrice: it?.unitPrice ?? 0,
          totalPrice: it?.totalPrice ?? 0,
          orderStatus: o?.status ?? "-",
          createdAt: o?.createdAt ?? null,
        }));
      },
      providesTags: (result, error, id) => [
        { type: "orders", id },
      ],
    }),
  }),
});

export const {
  useGetOrderItemsQuery,
  useGetOrderItemsByOrderIdQuery,
} = ordersItemApiSlice;
import { apiSlice } from "../api/apiSlice";

export const statusApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public Status Page (no auth required)
    getPublicStatus: builder.query({
      query: () => ({ url: "/superadmin/public/status", method: "GET" }),
      providesTags: [{ type: "status", id: "PUBLIC" }],
    }),

    // Incidents CRUD
    getIncidents: builder.query({
      query: () => ({ url: "/superadmin/incidents", method: "GET" }),
      transformResponse: (res) => res,
      providesTags: [{ type: "status", id: "INCIDENTS" }],
    }),

    createIncident: builder.mutation({
      query: (body) => ({
        url: "/superadmin/incidents",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "status", id: "INCIDENTS" }, { type: "status", id: "PUBLIC" }],
    }),

    updateIncident: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/superadmin/incidents/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "status", id: "INCIDENTS" }, { type: "status", id: "PUBLIC" }],
    }),

    deleteIncident: builder.mutation({
      query: (id) => ({ url: `/superadmin/incidents/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "status", id: "INCIDENTS" }],
    }),

    // Maintenance Mode
    getMaintenanceConfigs: builder.query({
      query: () => ({ url: "/superadmin/maintenance", method: "GET" }),
      providesTags: [{ type: "status", id: "MAINTENANCE" }],
    }),

    toggleMaintenance: builder.mutation({
      query: (body) => ({
        url: "/superadmin/maintenance",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "status", id: "MAINTENANCE" }, { type: "status", id: "PUBLIC" }],
    }),
  }),
});

export const {
  useGetPublicStatusQuery,
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
  useGetMaintenanceConfigsQuery,
  useToggleMaintenanceMutation,
} = statusApiSlice;

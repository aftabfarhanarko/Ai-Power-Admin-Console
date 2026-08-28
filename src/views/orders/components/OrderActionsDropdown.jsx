import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download } from "lucide-react";
import { generateParcelSlip } from "@/utils/parcelSlip";

const OrderActionsDropdown = ({
  order,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onPartialPayment,
  onDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(order.id)}
        >
          Copy Order ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            try {
              await generateParcelSlip(order);
              toast.success(
                t("orders.parcelSlipGenerated") ||
                  "Parcel slip generated successfully",
              );
            } catch (err) {
              console.error(err);
              toast.error(
                t("orders.parcelSlipFailed") ||
                  "Failed to generate parcel slip",
              );
            }
          }}
          className="cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          {t("orders.printParcelSlip") || "Print Parcel Slip"}
        </DropdownMenuItem>
        {(order.status?.toLowerCase() === "pending" || !order.status) && (
          <DropdownMenuItem onClick={onProcess}>
            Mark as Processing
          </DropdownMenuItem>
        )}
        {order.status?.toLowerCase() === "processing" && (
          <>
            {order.shippingTrackingId && (
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/orders/track?trackingId=${encodeURIComponent(order.shippingTrackingId)}`);
                }}
              >
                {t("orders.trackOrder")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onShip}>
              Mark as Shipped
            </DropdownMenuItem>
          </>
        )}
        {order.status?.toLowerCase() === "shipped" && (
          <>
            <DropdownMenuItem onClick={onDeliver}>
              Mark as Delivered
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className="text-red-600 focus:text-red-600"
            >
              {t("orders.cancelOrder")}
            </DropdownMenuItem>
          </>
        )}
        {order.status?.toLowerCase() === "cancelled" && (
          <DropdownMenuItem
            onClick={onRefund}
            className="text-orange-600 focus:text-orange-600"
          >
            {t("orders.refundOrder")}
          </DropdownMenuItem>
        )}
        {!order.isPaid &&
          order.status?.toLowerCase() !== "cancelled" && (
            <DropdownMenuItem onClick={onPartialPayment}>
              Record Payment
            </DropdownMenuItem>
          )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          Delete Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionsDropdown;

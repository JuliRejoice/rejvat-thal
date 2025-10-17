import React, { useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { Dirham } from "@/components/Svg";

interface InvoiceDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
  onPrint: () => void;
  thresholdAmount: any;
}

const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  open,
  onOpenChange,
  invoice,
  onPrint,
  thresholdAmount,
}) => {
  if (!invoice) return null;
  const taxPercentage = useMemo(() => {
    return thresholdAmount?.find((item: any) => item.restaurantId?._id === invoice?.restaurantId?._id)?.taxPercentage;
  }, [thresholdAmount]);

   const taxAmount = useMemo(
      () => (invoice?.subTotal * taxPercentage) / 100,
      [invoice?.subTotal, taxPercentage]
    );
  
      const dueAmount = useMemo(
        () => invoice?.finalAmmount - invoice?.advancePayment,
        [invoice?.finalAmmount, invoice?.advancePayment]
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header with Print Button */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Invoice #{invoice?.invoiceNo}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {invoice?.createdAt ? format(invoice?.createdAt, "EEEE, MMMM d, yyyy h:mm a") : ""}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-primary">
                  {invoice?.customerId?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {invoice?.customerId?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice?.customerId?.phone ? invoice?.customerId?.phone : invoice?.customerId?.email}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <Separator />

          {/* Services/Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <div className="space-y-3">
              {invoice?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.name}
                    </div>
                    {item.provider && (
                      <div className="text-sm text-muted-foreground">
                        by {item.provider}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    {/* <Dirham size={13} className="mt-0.5"/> */}
                    <span>{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{invoice?.subTotal?.toFixed(0)}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{invoice?.discount?.toFixed(0)}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{taxAmount?.toFixed(1)}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Additional Amount</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{invoice?.additionalAmount?.toFixed(0)}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rounding Off</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{invoice?.roundOffAmount}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground"> Advance Payment
                {
                  invoice?.advancePayment > 0 && (
                    <span
                      className={"px-2 py-1 ml-1 rounded-full text-xs font-medium bg-success/10 text-success"}
                    >
                      {invoice?.method?.type}
                    </span>
                  )
                }
              </span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{invoice?.advancePayment}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground"> Due Amount
              </span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Dirham size={12} />
                <span>{dueAmount.toFixed(2)}</span>
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-foreground">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-foreground flex items-center gap-1">
                <Dirham size={16} className="mt-1" />
                <span>{Math.round(invoice?.finalAmmount)}</span>
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailView;

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface InvoiceDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
  onPrint: () => void;
}

const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  open,
  onOpenChange,
  invoice,
  onPrint,
}) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header with Print Button */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Invoice #{invoice.invoiceNumber}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(invoice.date, "EEEE, MMMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-primary">
                  {invoice.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {invoice.customerName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.customerPhone}
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
              {invoice.items.map((item) => (
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
                  <div className="font-semibold text-foreground">
                    ₹ {item.price.toFixed(0)}
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
              <span className="font-medium text-foreground">
                ₹ {invoice.subtotal.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-foreground">
                ₹ {invoice.discount.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium text-foreground">
                ₹ {invoice.tax.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Additional Amount</span>
              <span className="font-medium text-foreground">
                ₹ {invoice.additionalAmount.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rounding Off</span>
              <span className="font-medium text-foreground">
                ₹ {invoice.roundingOff.toFixed(1)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-foreground">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-foreground">
                ₹ {Math.round(invoice.total)}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Payment Method:{" "}
              <span className="font-medium text-foreground capitalize">
                {invoice.paymentMethod}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailView;

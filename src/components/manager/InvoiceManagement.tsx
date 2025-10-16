import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { format } from "date-fns";
import { Plus, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import InvoiceFilter from "../common/InvoiceFilter";
import { Dirham } from "../Svg";
import { invoiceApi, InvoiceItem, GetInvoicesParams } from "@/api/invoice.api";
import AddInvoice from "../common/AddInvoice";
import { formatDateParam } from "@/lib/utils";
import InvoiceDetailView from "../common/InvoiceDetailView";
import { useAuth } from "@/contexts/AuthContext";
import { getPaymentMethods } from "@/api/paymentMethod.api";
import { useQueries } from "@tanstack/react-query";
import { getAllIncomeCategory } from "@/api/incomeCategories.api";
import { getThresholdAmont } from "@/api/settings.api";

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [selectedInvoiceToView, setSelectedInvoiceToView] = useState<InvoiceItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    preset: "All",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  
   const queriesResults = useQueries({
    queries: [
      {
        queryKey: ["get-payment-methods"],
        queryFn: () => getPaymentMethods(),
      },
      {
        queryKey: ["income-categories"],
        queryFn: () => getAllIncomeCategory({}),
      },
      {
        queryKey: ["get-threshold-amount"],
        queryFn: () => getThresholdAmont({ }),
      },
    ],
  });

    const [
    getPaymentMethodsQuery,
    getIncomeCategoriesQuery,
    getThresholdAmountQuery,
  ] = queriesResults;

  const { data: paymentMethods } = getPaymentMethodsQuery;
  const { data: incomeCategories } = getIncomeCategoriesQuery;
  const { data: thresholdAmount } = getThresholdAmountQuery;


  // Form state for new invoice
  const [formData, setFormData] = useState({
    customerId: "",
    items: [] as Array<{
      id: string;
      name: string;
      price: number;
      type: "service" | "product";
      quantity?: number;
      provider?: string;
    }>,
    subtotal: 0,
    tax: 0,
    discount: 0,
    additionalAmount: 0,
    roundingOff: 0,
    total: 0,
    paymentMethod: "cash",
    status: "pending",
    notes: "",
    createdBy: user?._id || "",
    restaurantId: user?.role === "manager" ? user.restaurantId?._id || "" : ""
  });


  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    setCurrentPage,
  } = usePagination({
    data: invoices,
    itemsPerPage: itemsPerPage,
    totalItems: totalItems,
  });

  console.log(totalItems, "totalItems");
  const fetchInvoices = async (
    page: number = currentPage,
    limit: number = itemsPerPage
  ) => {
    setIsLoading(true);

    const params: GetInvoicesParams = { page, limit };
    params.restaurantId = user?.role === "manager" ? user.restaurantId?._id : null;
    //  Send only filled filters, formatted as YYYY-MM-DD
    if (filters.searchQuery?.trim()) {
      params.search = filters.searchQuery.trim();
    }
    if (filters.startDate && filters.endDate) {
      params.startDate = formatDateParam(filters.startDate);
      params.endDate = formatDateParam(filters.endDate);  
    }

    try {
      const response = await invoiceApi.getInvoices(params);
      const { items: fetchedItems = [], total = 0 } = response || {};
      setInvoices(fetchedItems);
      setTotalItems(Number(total) || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchInvoices(currentPage);
    };
    fetchData();
  }, [currentPage, filters, itemsPerPage]);

  const handleItemsPerPageNumberChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success";
      case "part_paid":
        return "bg-warning/10 text-warning";
      case "unpaid":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleViewInvoice = (invoice: InvoiceItem) => {
    setSelectedInvoiceToView(invoice);
    setIsViewDialogOpen(true);
  };

  const handleCreateInvoice = async (invoiceData: any) => {

    console.log(invoiceData, "invoiceData")
    try {
      setIsSubmitting(true);
      // Add the current user and restaurant ID to the invoice data
      const invoiceToCreate = {
        ...invoiceData,
        createdBy: user?._id,
        restaurantId: user?.role === 'manager' ? user.restaurantId?._id : null
      };

      // Call the API to create the invoice
      const createdInvoice = await invoiceApi.createInvoice(invoiceToCreate);
      
      // Show success message
      toast.success('Invoice created successfully');
      
      // Close the add modal
      setIsAddModalOpen(false);
      
      // Refresh the invoices list
      await fetchInvoices(1);
      
      setSelectedInvoiceToView(createdInvoice);
      
      return createdInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (selectedInvoiceToView) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(generatePrintHTML(selectedInvoiceToView));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + numberToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + numberToWords(num % 1000) : "")
      );
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + numberToWords(num % 100000) : "")
    );
  };

  const generatePrintHTML = (invoice: InvoiceItem) => {
    const services = invoice.items.filter((item) => item.type === "service");
    const products = invoice.items.filter((item) => item.type === "product");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #000; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 32px; margin-bottom: 10px; color: #1a1a1a; }
          .header h2 { font-size: 24px; margin-bottom: 15px; color: #333; }
          .header p { font-size: 14px; color: #666; line-height: 1.6; }
          .invoice-title { text-align: center; font-size: 28px; font-weight: bold; margin: 20px 0; color: #000; }
          .info-section { display: flex; justify-between; margin: 30px 0; }
          .bill-to, .invoice-details { flex: 1; }
          .bill-to h3, .invoice-details h3 { font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
          .bill-to p, .invoice-details p { font-size: 14px; margin: 5px 0; color: #333; }
          .section-title { font-size: 18px; font-weight: bold; margin: 25px 0 15px; padding-bottom: 8px; border-bottom: 2px solid #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; border-bottom: 2px solid #ddd; }
          td { padding: 12px; font-size: 14px; border-bottom: 1px solid #eee; }
          .text-right { text-align: right; }
          .summary { margin-top: 30px; margin-left: auto; width: 400px; }
          .summary-row { display: flex; justify-between; padding: 10px 0; font-size: 14px; }
          .summary-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 15px; margin-top: 10px; }
          .payment-info { margin: 30px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          .payment-info h3 { font-size: 16px; margin-bottom: 10px; }
          .amount-words { font-size: 14px; font-style: italic; color: #555; margin-top: 10px; }
          .terms { margin-top: 30px; }
          .terms h3 { font-size: 16px; margin-bottom: 10px; }
          .terms p { font-size: 13px; line-height: 1.6; color: #666; margin: 5px 0; }
          .thank-you { text-align: center; margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 5px; }
          .thank-you p { font-size: 14px; color: #555; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h2>Your Business Name</h2>
            <p>Shop-1 Building No-03, Business District<br>
            Your City, State - 123456<br>
            Phone: +91 9876543210<br>
            GSTIN: 22AAAAA0000A1Z5</p>
          </div>

          <div class="invoice-title">INVOICE</div>

          <div class="info-section">
            <div class="bill-to">
              <h3>Bill To</h3>
              <p><strong>${invoice.customerName}</strong></p>
              <p>${invoice.customerPhone}</p>
            </div>
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice No.:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${format(invoice.date, "dd/MM/yy")}</p>
              <p><strong>Time:</strong> ${format(invoice.date, "h:mm a")}</p>
            </div>
          </div>

          <div class="section-title">Bill Details</div>

          ${
            services.length > 0
              ? `
            <h4 style="font-size: 16px; margin: 15px 0 10px; font-weight: 600;">Services</h4>
            <table>
              <thead>
                <tr>
                  <th>Details</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${services
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      ${item.name}
                      ${
                        item.provider
                          ? `<br><small style="color: #666;">by ${item.provider}</small>`
                          : ""
                      }
                    </td>
                    <td class="text-right">₹${item.price.toFixed(0)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : ""
          }

          ${
            products.length > 0
              ? `
            <h4 style="font-size: 16px; margin: 15px 0 10px; font-weight: 600;">Products</h4>
            <table>
              <thead>
                <tr>
                  <th>Details</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${
                      item.quantity || 1
                    } x ₹${item.price.toFixed(0)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : ""
          }

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹ ${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${
              invoice.discount > 0
                ? `
              <div class="summary-row">
                <span>Total discount</span>
                <span>- ₹ ${invoice.discount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Discounted Price</span>
                <span>₹ ${(invoice.subtotal - invoice.discount).toFixed(
                  2
                )}</span>
              </div>
            `
                : ""
            }
            <div class="summary-row">
              <span>GST</span>
              <span>+ ₹ ${invoice.tax.toFixed(2)}</span>
            </div>
            ${
              invoice.additionalAmount > 0
                ? `
              <div class="summary-row">
                <span>Additional Amount</span>
                <span>+ ₹ ${invoice.additionalAmount.toFixed(0)}</span>
              </div>
            `
                : ""
            }
            <div class="summary-row">
              <span>Rounding off</span>
              <span>₹ ${invoice.roundingOff.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>Bill Amount</span>
              <span>₹ ${invoice.total}</span>
            </div>
          </div>

          <div class="payment-info">
            <h3>Payment by ${invoice.paymentMethod.toUpperCase()}</h3>
            <div class="amount-words">
              Amount in words: ${numberToWords(invoice.total)} Only
            </div>
          </div>

          <div class="terms">
            <h3>Terms and Conditions</h3>
            <p>Material once sold will not be returned.</p>
            <p>All disputes are subjected to local jurisdiction.</p>
          </div>

          <div class="thank-you">
            <p>Thank you for choosing us! We appreciate your visit and look forward to seeing you again soon.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Invoice Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage customer invoices
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row w-full gap-4 items-center justify-between">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <InvoiceFilter
                  onFilterChange={setFilters}
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-9 w-9 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invoice?.customerId?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(invoice.createdAt, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{invoice.items.length} items</TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex items-center gap-1">
                            <Dirham size={12} />
                            {invoice?.finalAmmount?.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex items-center gap-1">
                            <Dirham size={12} />
                            {invoice?.advancePayment?.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(invoice.invoiceStatus)
                            )}
                          >
                            {invoice.invoiceStatus == "part_paid" ? "Part Paid" : invoice.invoiceStatus == "unpaid" ? "Unpaid" : invoice.invoiceStatus == "paid" ? "Paid" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalItems > 0 && (
              <div className="mt-4">
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onNextPage={nextPage}
                  onPreviousPage={previousPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={handleItemsPerPageNumberChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
        {isViewDialogOpen && (
         <InvoiceDetailView
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          invoice={selectedInvoiceToView}
          thresholdAmount={thresholdAmount?.payload?.data}
          onPrint={handlePrintInvoice}
        />
      )}
      </div>

      {isAddModalOpen && (
        <AddInvoice
          onClose={() => setIsAddModalOpen(false)}
          onCreateInvoice={handleCreateInvoice}
          paymentMethods={paymentMethods?.payload?.data}
          incomeCategories={incomeCategories?.payload?.data}
          isSubmitting={isSubmitting}
          thresholdAmount={thresholdAmount?.payload?.data}
        />
      )}
    </>
  );
};

export default InvoiceManagement;

import React from "react";
import { Card } from "@/components/ui/card";
import { Receipt, Wallet } from "lucide-react";

export const PaymentMethodEmpty = () => (
  <div className="flex items-center justify-center py-10">
    <div className="text-center text-muted-foreground">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Wallet className="h-5 w-5" />
      </div>
      <p className="font-medium text-foreground">No payment method stats</p>
      <p className="text-sm">Add an income or expense to see balances by method.</p>
    </div>
  </div>
);

export const TransactionsEmpty = () => (
  <Card className="border-dashed">
    <div className="flex items-center justify-center py-10">
      <div className="text-center text-muted-foreground">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Receipt className="h-5 w-5" />
        </div>
        <p className="font-medium text-foreground">No transactions found</p>
        <p className="text-sm">Try adjusting filters or add a new transaction.</p>
      </div>
    </div>
  </Card>
);

export default {
  PaymentMethodEmpty,
  TransactionsEmpty,
};



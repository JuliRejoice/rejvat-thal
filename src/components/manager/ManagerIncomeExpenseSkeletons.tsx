import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

export const BalanceOverviewSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, idx) => (
      <Card className="shadow-card" key={idx}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    ))}
  </>
);

export const PaymentMethodStatsSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between text-sm font-medium border-t pt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    ))}
  </>
);

export const TransactionTableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, idx) => (
      <TableRow key={idx}>
        <TableCell>
          <Skeleton className="h-6 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-28" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export default {
  BalanceOverviewSkeleton,
  PaymentMethodStatsSkeleton,
  TransactionTableSkeleton,
};



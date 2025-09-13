import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export const VendorStatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className={`h-4 mb-2`} />
                <Skeleton className={`h-8 w-16}`} />
              </div>
              <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const VendorTableSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      {/* Vendor Column */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28 mt-1" />
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <Skeleton className="h-4 w-full" />
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className={`h-3 ${item === 1 ? "w-24" : "w-28"}`} />
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-16" />
        </div>
      </TableCell>

      {/* Due Amount Column */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-12" />
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell>
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>

      {/* Actions Column */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 sm:gap-2">
          {[1, 2, 3].map((action) => (
            <Skeleton key={action} className="h-8 w-8" />
          ))}
        </div>
      </TableCell>
    </TableRow>
  ));
};

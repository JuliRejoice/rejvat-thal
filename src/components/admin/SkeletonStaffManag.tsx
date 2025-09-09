import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

// Stats Cards Skeleton
export const StatsCardsSkeleton = () => {
  return Array.from({ length: 4 }).map((_, index) => (
    <div
      key={index}
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  ));
};

// Staff Table Skeleton
export const StaffTableSkeleton = ({ isMobile = false }) => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
                {isMobile && <Skeleton className="h-3 w-48" />}
              </div>
            </div>
          </TableCell>

          {!isMobile && (
            <TableCell>
              <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
          )}
          {!isMobile && (
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-2 w-16 rounded-full" />
              </div>
            </TableCell>
          )}
          {!isMobile && (
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
          )}

          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>

          <TableCell className="text-right">
            <div className="flex justify-end gap-1 sm:gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

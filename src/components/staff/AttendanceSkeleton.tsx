import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AttendanceRecordsSkeleton = () => {
  return (
      <CardContent>
        <div className="space-y-3">
          {/* Generate 5 skeleton items */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-3 p-3 border rounded-lg">
              <div className="col-span-2 flex items-center space-x-3">
                {/* Status icon skeleton */}
                <div className="p-2 rounded-lg bg-muted">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="space-y-2 flex-1">
                  {/* Date skeleton */}
                  <Skeleton className="h-5 w-20" />
                  {/* Check-in time skeleton */}
                  <Skeleton className="h-4 w-32" />
                  {/* Notes skeleton (randomly show/hide) */}
                  {index % 3 === 0 && <Skeleton className="h-4 w-48" />}
                </div>
              </div>
              <div className="flex items-center gap-7 justify-end">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="w-12 h-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
  );
};

// Monthly Summary Skeleton
export const MonthlyAttendanceSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-24 h-10 rounded-md" />
              <Skeleton className="w-32 h-10 rounded-md" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="text-center p-4 bg-muted/30 border border-border rounded-lg"
              >
                <Skeleton className="h-8 w-8 mx-auto mb-2 rounded" />
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))}
          </div>

          {/* Attendance rate skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

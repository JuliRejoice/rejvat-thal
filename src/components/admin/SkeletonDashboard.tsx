import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const RestaurantOverviewSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex px-4 py-3 items-center border m-4 rounded-md"
          >
            <div className="flex-1 min-w-[150px] flex items-center gap-3">
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex-none w-[120px]">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>
            <div className="flex-none w-[120px]">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>
            <div className="flex-none w-[120px]">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>
            <div className="flex-none w-[100px] flex justify-end">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

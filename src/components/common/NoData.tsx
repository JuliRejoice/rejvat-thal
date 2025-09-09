import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface NoDataProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const NoData = ({ title, description, icon: Icon }: NoDataProps) => {
  return (
    <Card className="border-dashed border-gray-200">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

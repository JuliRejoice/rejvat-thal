import React, { memo, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview, type ApiResponse, type DashboardResponse, type OverviewCardProps } from "@/api/dashboard.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, Plus, Loader2 } from "lucide-react";
import { Dirham } from "../Svg";

const AdminDashboard = () => {
  const { data, isLoading } = useQuery<ApiResponse<DashboardResponse>>({
    queryKey: ["get-dashboard-overview"],
    queryFn: () => getDashboardOverview('/transaction/getRestaurantOverview'),
  });

  const dashboardData = data?.payload;
  const overViewDetails = [
    { title: "Total Income", value: dashboardData?.overall?.income ?? 0, icon: <TrendingUp className="h-4 w-4 text-metrics-income" />, color: "text-metrics-income", bg: "bg-metrics-income/10" },
    { title: "Total Expense", value: dashboardData?.overall?.expense ?? 0, icon: <TrendingDown className="h-4 w-4 text-metrics-expense" />, color: "text-metrics-expense", bg: "bg-metrics-expense/10" },
    { title: "Net Balance", value: dashboardData?.overall?.totalBalance ?? 0, icon: <DollarSign className="h-4 w-4 text-metrics-balance" />, color: "text-metrics-balance", bg: "bg-metrics-balance/10" },
  ]
  const OverviewCard = memo(({ title, value, icon, color, bg }: OverviewCardProps) => {
    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center text-2xl font-bold ${color}`}>
            <Dirham className="pt-px mr-1" /> {value.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
    );
  });
  OverviewCard.displayName = "OverviewCard";


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all restaurant operations</p>
        </div>
      </div>
      {isLoading ? <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div> : <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-6">
          {overViewDetails.map((item, idx) => (
            <OverviewCard
              key={idx}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              bg={item.bg}
            />
          ))}
        </div>
        <Card className="shadow-card">
          <CardHeader className='px-5 pb-0'>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Restaurant Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Performance summary of all restaurants</p>
          </CardHeader>
          <CardContent className='p-0'>
            <div className="overflow-x-auto">
              {dashboardData?.byRestaurant?.length && dashboardData?.byRestaurant.map((ele, index) => (
                <div key={index} className="flex px-4 py-3 items-center border m-4 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-[150px] flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div><h3 className="font-medium">{ele.restaurant}</h3></div>
                  </div>
                  <div className="flex-none w-[120px] text-metrics-income font-medium"><span className="inline-flex justify-end items-center gap-1"><Dirham size={12} />{(ele?.income ?? 0).toLocaleString()}</span><p className="text-xs  text-muted-foreground">Income</p></div>
                  <div className="flex-none w-[120px] text-metrics-expense font-medium"><span className="inline-flex justify-end items-center gap-1"><Dirham size={12} />{(ele?.expense ?? 0).toLocaleString()}</span><p className="text-xs text-muted-foreground">Expence</p></div>
                  <div className="flex-none w-[120px] text-metrics-balance font-medium"><span className="inline-flex justify-end items-center gap-1"><Dirham size={12} />{(ele?.totalBalance ?? 0).toLocaleString()}</span>  <p className="text-xs text-muted-foreground">Balance</p></div>
                  <div className="flex-none w-[100px] flex justify-end">
                    <Badge variant={ele?.isActive ? "default" : "secondary"} className="capitalize">{ele.isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}{ele.isActive ? "Active" : "Deactive"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>}

      {/* Future sections (Pending Actions, Recent Activities) */}
      {/*
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card"><CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-warning" />Pending Actions</CardTitle></CardHeader><CardContent>...</CardContent></Card>
        <Card className="shadow-card"><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Recent Activities</CardTitle></CardHeader><CardContent>...</CardContent></Card>
      </div>
      */}
    </div>
  );
};

export default AdminDashboard;
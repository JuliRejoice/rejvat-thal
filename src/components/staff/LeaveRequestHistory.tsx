import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Eye, Clock, User, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllLeaveRequest } from '@/api/attendance.api';

type LeaveRequest = {
  id: string;
  date: string; // formatted for display; could be range: fromDate - toDate
  reason: string;
  status: 'approved' | 'rejected' | 'pending' | string;
  appliedOn: string;
  selfieUrl: string | null;
  approvedBy: string | null;
  approvedOn: string | null;
  comments: string | null;
};

const LeaveRequestHistory = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllLeaveRequest();
        // Expecting res to contain an array. Try several common shapes.
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.result)
              ? res.result
              : Array.isArray(res?.leaveRequests)
                ? res.leaveRequests
                : Array.isArray(res?.payload?.data)
                  ? res.payload.data
                  : [];

        const mapped: LeaveRequest[] = list.map((item: any) => {
          const id = String(item._id ?? item.id);
          const fromDate = item.fromDate ?? item.date ?? item.startDate ?? item.createdAt;
          const toDate = item.toDate ?? item.endDate ?? item.date ?? item.updatedAt ?? item.createdAt;
          const appliedOn = item.appliedOn ?? item.createdAt ?? item.requestedOn ?? item.created_at;
          const status = String(item.status ?? 'pending').toLowerCase();

          const format = (d: any) => {
            try {
              if (!d) return '-';
              const dt = new Date(d);
              if (isNaN(dt.getTime())) return String(d);
              return dt.toISOString().slice(0, 10);
            } catch {
              return String(d);
            }
          };

          const displayDate = fromDate && toDate && fromDate !== toDate
            ? `${format(fromDate)} - ${format(toDate)}`
            : format(fromDate ?? toDate);

          return {
            id,
            date: displayDate,
            reason: item.reason ?? '-',
            status: status as LeaveRequest['status'],
            appliedOn: format(appliedOn),
            selfieUrl: item.selfieUrl ?? item.fileUrl ?? null,
            approvedBy: item.approvedBy ?? item.approverName ?? null,
            approvedOn: item.approvedOn ? format(item.approvedOn) : null,
            comments: item.comments ?? item.remark ?? null,
          };
        });

        setLeaveRequests(mapped);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedRequests,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
    reset
  } = usePagination({
    data: filteredRequests,
    itemsPerPage
  });

  const handleViewRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStats = () => {
    return {
      total: leaveRequests.length,
      approved: leaveRequests.filter(r => r.status === 'approved').length,
      pending: leaveRequests.filter(r => r.status === 'pending').length,
      rejected: leaveRequests.filter(r => r.status === 'rejected').length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Request History</h1>
          <p className="text-muted-foreground">Track your leave applications and their status</p>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Date</TableHead>
                      <TableHead>Reason</TableHead>
                      {!isMobile && <TableHead>Applied On</TableHead>}
                      <TableHead>Status</TableHead>
                      {!isMobile && <TableHead>Approved By</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{request.date}</span>
                          </div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              Applied: {request.appliedOn}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{request.reason}</p>
                          </div>
                        </TableCell>
                        {!isMobile && <TableCell>{request.appliedOn}</TableCell>}
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            {request.approvedBy || '-'}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                startIndex={startIndex}
                endIndex={endIndex}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={goToPage}
                onNextPage={nextPage}
                onPreviousPage={previousPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* View Request Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Leave Date</h3>
                <Badge
                  variant={getStatusVariant(selectedRequest.status)}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status}
                </Badge>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{selectedRequest.date}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason</label>
                  <p className="text-sm mt-1">{selectedRequest.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Applied On</label>
                    <p className="text-sm mt-1">{selectedRequest.appliedOn}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-sm mt-1 capitalize">{selectedRequest.status}</p>
                  </div>
                </div>

                {selectedRequest.approvedBy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                      <p className="text-sm mt-1">{selectedRequest.approvedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved On</label>
                      <p className="text-sm mt-1">{selectedRequest.approvedOn}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.comments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Comments</label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRequest.comments}</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Selfie Submitted
                  </label>
                  <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                    {selectedRequest.selfieUrl ? (
                      <Avatar className="h-16 w-16 mx-auto">
                        <AvatarImage src={selectedRequest.selfieUrl} />
                        <AvatarFallback>Self</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="text-muted-foreground">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Selfie was submitted with the request</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveRequestHistory;
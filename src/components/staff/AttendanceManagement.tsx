import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  MapPin,
  Smartphone,
  AlertCircle,
  UserCheck,
  Upload,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAttendance,
  getStaffAttendance,
  getMonthlyStaffAttendance,
  leaveRequest,
  checkInAttendance,
  checkOutAttendance,
} from "@/api/attendance.api";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, setDate } from "date-fns";
import {
  AttendanceRecordsSkeleton,
  MonthlyAttendanceSkeleton,
} from "./AttendanceSkeleton";
import { NoData } from "../common/NoData";
import { useToast } from "@/hooks/use-toast";
import Webcam from "react-webcam";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NotesDisplay = ({ notes }: { notes: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 30;
  const shouldTruncate = notes.length > maxLength;

  const displayedText =
    isExpanded || !shouldTruncate ? notes : `${notes.slice(0, maxLength)}...`;

  return (
    <p className="text-sm text-muted-foreground">
      <b className="text-gray-800">Additional Notes</b>: {displayedText}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 underline text-xs"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </p>
  );
};

const AttendanceManagement = () => {
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    null
  );
  const [leaveImagePreview, setLeaveImagePreview] = useState<string | null>(
    null
  );

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate year options (current year and 5 previous years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  // Generate month options with names
  const getMonthOptions = () => {
    return [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  };

  const selectedYearMonth = `${selectedYear}-${selectedMonth}`;
  const { startDateOfMonth, endDateOfMonth } = React.useMemo(() => {
    const yearNum = Number(selectedYear);
    const monthNum = Number(selectedMonth); // 1-12
    const firstDay = new Date(yearNum, monthNum - 1, 1);
    const lastDay = new Date(yearNum, monthNum, 0);
    return {
      startDateOfMonth: format(firstDay, "yyyy-MM-dd"),
      endDateOfMonth: format(lastDay, "yyyy-MM-dd"),
    };
  }, [selectedYear, selectedMonth]);

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      file: null as File | null,
      notes: "",
    },
  });

  useEffect(() => {
    register("file", { required: "Attendance Picture is required" });
  }, [register]);

  const {
    data: getAttenStafWise,
    isPending,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: [
      "get-attendance-by-staff",
      { startDate: startDateOfMonth, endDate: endDateOfMonth },
    ],
    queryFn: () =>
      getStaffAttendance({
        startDate: startDateOfMonth,
        endDate: endDateOfMonth,
      }),
  });
  const attendanceData = getAttenStafWise?.payload?.data;
  const hasMarkedToday = React.useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return false;
    const todayStr = new Date().toDateString();
    return attendanceData.some((rec: any) => {
      const d = rec?.checkInAt ? new Date(rec.checkInAt) : null;
      return d && d.toDateString() === todayStr && rec.status === "present";
    });
  }, [attendanceData]);

  const {
    data: todaySummary,
    refetch: refetchTodaySummary,
    isPending: isTodaySummaryPending,
  } = useQuery({
    queryKey: [
      "get-monthly-staff-attendance",
      user?.restaurantId._id,
      startDateOfMonth,
      endDateOfMonth,
    ],
    queryFn: () =>
      getMonthlyStaffAttendance(
        user?.restaurantId._id,
        startDateOfMonth,
        endDateOfMonth
      ),
    enabled: Boolean(
      user?.restaurantId._id && startDateOfMonth && endDateOfMonth
    ),
  });

  const { mutate: createAtten, isPending: isCreatePending } = useMutation({
    mutationKey: ["create-attendance"],
    mutationFn: createAttendance,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Attendance marked",
        description: "Your attendance has been recorded successfully.",
      });
      setIsMarkingAttendance(false);
      reset();
      // Refresh summary and records
      refetchTodaySummary();
      refetchRecords();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to mark attendance",
        description: error?.message || "Please try again.",
      });
    },
  });

  const addAttendance = (data: any) => {
    const attendanceData = {
      ...data,
      restaurantId: user?.restaurantId._id,
      date: format(new Date(), "yyyy-MM-dd"),
      checkInAt: format(new Date(), "yyyy-MM-dd"),
      status: "present",
    };
    createAtten(attendanceData);
  };

  const AttendanceMarkModal = ({
    localImagePreview,
    setLocalImagePreview,
  }: {
    localImagePreview: string | null;
    setLocalImagePreview: (preview: string | null) => void;
  }) => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState<string | null>(null);
    const [clockOutTime, setClockOutTime] = useState<string | null>(null);
    const [attendanceId, setAttendanceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
      if (!user?._id) return;

      const saved = localStorage.getItem(`attendance_${user._id}`);
      if (saved) {
        const data = JSON.parse(saved);
        setIsClockedIn(data.isClockedIn);
        setAttendanceId(data.attendanceId);
        setClockInTime(data.clockInTime);
      }
    }, [user?._id]);

    const capturePhoto = () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.log("⚠️ Screenshot returned null. Is camera active?");
        return;
      }

      // Show preview immediately
      setLocalImagePreview(imageSrc);
      // setIsCameraActive(false);

      // Convert base64 to File without fetch
      const base64ToFile = (base64: string, filename: string) => {
        const arr = base64.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const file = base64ToFile(imageSrc, `selfie_${Date.now()}.jpg`);
      if (file) {
        setValue("file", file, { shouldValidate: true });
      }

      toast({
        variant: "default",
        title: "Photo captured",
        description: "Your selfie has been captured successfully.",
      });
    };

    const retakePhoto = () => {
      setLocalImagePreview(null);
    };

    const handleClockAction = async () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (isLoading) return;
      setIsLoading(true);

      try {
        if (!isClockedIn) {
          if (!localImagePreview) {
            alert("Please take a selfie before clocking in!");
            setIsLoading(false);
            return;
          }

          const payload = new FormData();
          payload.append("_id", user?._id);
          payload.append("date", now.toISOString().split("T")[0]);
          payload.append("status", "present");
          payload.append("checkInAt", now.toISOString());
          payload.append("notes", "Checked in successfully");
          for (let pair of payload.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }

          const blob = await (await fetch(localImagePreview)).blob();
          const file = new File([blob], `selfie_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          payload.append("file", file);

          const res = await checkInAttendance(payload);
          console.log(res);

          const id = res.data?._id || null;
          setAttendanceId(id);
          setIsClockedIn(true);
          setClockInTime(formattedTime);

          localStorage.setItem(
            `attendance_${user?._id}`,
            JSON.stringify({
              isClockedIn: true,
              attendanceId: id,
              clockInTime: formattedTime,
            })
          );

          toast({
            title: "Clocked in successfully!",
            variant: "default",
          });
        } else {
          if (!attendanceId) {
            alert("No active attendance found to checkout.");
            setIsLoading(false);
            return;
          }

          const payload = new FormData();
          payload.append("checkOutAt", now.toISOString());

          await checkOutAttendance(user?._id, payload);

          setClockOutTime(formattedTime);
          setIsClockedIn(false);
          setAttendanceId(null);

          localStorage.removeItem(`attendance_${user?._id}`);

          toast({
            title: "Checked out successfully!",
            variant: "default",
          });
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Attendance error occurred";

        if (status === 409 || message.includes("pending attendance")) {
          toast({
            variant: "destructive",
            title: "Pending Attendance",
            description:
              "You have pending attendance. Please checkout before checking in again.",
          });

          setIsClockedIn(true);

          const payloadData = error?.response?.data?.payload;
          if (payloadData?._id) setAttendanceId(payloadData._id);

          localStorage.setItem(
            `attendance_${user?._id}`,
            JSON.stringify({
              isClockedIn: true,
              attendanceId: payloadData?._id || null,
              clockInTime:
                payloadData?.checkInAt ||
                formattedTime ||
                new Date().toISOString(),
            })
          );
        } else {
          console.error("Attendance Error:", error);
          alert("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    console.log("Saved attendance state:", user?._id);
    return (
      <DialogContent
        className="max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Mark Your Attendance
          </DialogTitle>
          <DialogDescription>
            Take a selfie to mark your attendance for today
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(addAttendance)}>
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <div className="flex gap-3 items-baseline">
                  <Label>Take a selfie *</Label>
                </div>

                <div className="upload-box space-y-3 flex flex-col justify-center items-center border border-dashed border-2 rounded-xl p-3">
                  {!localImagePreview &&
                    (isCameraActive ? (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-[300px] h-[200px] object-cover rounded-xl border"
                      />
                    ) : (
                      <div className="flex flex-col justify-center gap-2 items-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <Button
                          type="button"
                          onClick={() => setIsCameraActive(true)}
                        >
                          Take Photo
                        </Button>
                      </div>
                    ))}

                  {localImagePreview && (
                    <img
                      src={localImagePreview}
                      alt="Captured selfie"
                      className="w-[300px] h-[200px] object-cover rounded-xl border"
                    />
                  )}

                  <div className="flex gap-2">
                    {!localImagePreview ? (
                      isCameraActive ? (
                        <Button type="button" onClick={capturePhoto}>
                          Capture
                        </Button>
                      ) : null
                    ) : (
                      <Button type="button" onClick={retakePhoto}>
                        Retake
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-3 items-baseline">
                    <Label htmlFor="notes">Notes</Label>
                  </div>
                  <Textarea
                    id="notes"
                    placeholder="Enter notes"
                    autoFocus={false}
                    tabIndex={-1}
                    {...register("notes")}
                  />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 space-y-2 text-gray-700 text-sm">
                  <h1 className="text-sm font-semibold">Guidelines:</h1>
                  <p>• Ensure good lighting for clear photo</p>
                  <p>• Face should be clearly visible</p>
                  <p>• Remove any face coverings</p>
                  <p>• Be at your workplace location</p>
                </div>
                {/* <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" disabled={isCreatePending}>
                    {isCreatePending && (
                      <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
                    )}
                    Mark Attendance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsMarkingAttendance(false);
                      reset();
                    }}
                    disabled={isCreatePending}
                  >
                    Cancel
                  </Button>
                </div> */}
                <div className="flex justify-end gap-3 pt-2">
                  {clockInTime && (
                    <Button
                      variant="outline"
                      className="text-sm border border-green-600 text-green-700"
                    >
                      Clock In: {clockInTime}
                    </Button>
                  )}
                  {!clockOutTime && (
                    <Button type="button" onClick={handleClockAction}>
                      {isClockedIn ? "Clock Out" : "Clock In"}
                    </Button>
                  )}
                  {clockOutTime && (
                    <Button
                      variant="outline"
                      className="text-sm border border-red-600 text-red-700"
                    >
                      Clock Out: {clockOutTime}
                    </Button>
                  )}
                  {!clockOutTime && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMarkingAttendance(false);
                        reset();
                      }}
                      disabled={isCreatePending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    );
  };

  const LeaveApplicationModal = ({
    leaveImagePreview,
    setLeaveImagePreview,
  }: {
    leaveImagePreview: string | null;
    setLeaveImagePreview: (preview: string | null) => void;
  }) => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
      null,
      null,
    ]);
    const [startDate, endDate] = dateRange;
    const [leaveImageMode, setLeaveImageMode] = useState<"upload" | "selfie">(
      "selfie" as "upload" | "selfie"
    );
    const [isLeaveCameraOn, setIsLeaveCameraOn] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
      handleSubmit: handleLeaveSubmit,
      register: registerLeave,
      setValue: setLeaveValue,
      watch: watchLeave,
      formState: { errors: leaveErrors },
      reset: resetLeave,
      trigger,
    } = useForm({
      defaultValues: {
        fromDate: null,
        toDate: null,
        reason: "",
        status: "pending",
        file: null as File | null,
        isMultiDay: false as boolean,
      },
    });

    // Set initial date range from form values
    useEffect(() => {
      const fromDate = watchLeave("fromDate");
      const toDate = watchLeave("toDate");
      if (fromDate && toDate) {
        setDateRange([new Date(fromDate), new Date(toDate)]);
      }
    }, []);

    const { mutate: submitLeave, isPending: isLeavePending } = useMutation({
      mutationKey: ["leave-request"],
      mutationFn: leaveRequest,
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Leave request submitted",
          description: "Your leave request has been sent for review.",
        });
        resetLeave();
        setDateRange([null, null]);
        setIsApplyingLeave(false);
        setIsCalendarOpen(false);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Failed to submit leave request",
          description: error?.message || "Please try again.",
        });
      },
    });

    const handleOnChange = (dates: [Date | null, Date | null]) => {
      const [start, end] = dates;
      setDateRange(dates);

      // Format dates to YYYY-MM-DD
      const formatDate = (date: Date | null) =>
        date?.toISOString().split("T")[0] || "";

      if (start) {
        setLeaveValue("fromDate", formatDate(start));
        setLeaveValue("toDate", formatDate(end || start)); // If no end date, use start date

        if (start && end) {
        }
      }
    };

    const onSubmitLeave = (data: any) => {
      submitLeave({
        restaurantId: user?.restaurantId._id as string,
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason,
        status: data.status ?? "pending",
        file: data.file ?? null,
      });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setLeaveValue("file", file);
        setLeaveImagePreview(URL.createObjectURL(file));
      }
    };

    const captureLeavePhoto = () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Show preview immediately
      setLeaveImagePreview(imageSrc);

      // Convert base64 to File without fetch
      const base64ToFile = (base64: string, filename: string) => {
        const arr = base64.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const file = base64ToFile(imageSrc, `selfie_${Date.now()}.jpg`);
      if (file) {
        setLeaveValue("file", file);
      }

      // Stop camera
      setIsLeaveCameraOn(false);

      toast({
        variant: "default",
        title: "Photo captured",
        description: "Your selfie has been captured successfully.",
      });
    };

    const retakeLeavePhoto = () => {
      setLeaveImagePreview(null);
      setIsLeaveCameraOn(true);
    };
    // useEffect(() => {
    //   return () => {
    //     stopCamera();
    //     if (imagePreview) URL.revokeObjectURL(imagePreview);
    //   };
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return (
      <>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Apply for Leave
            </DialogTitle>
            <DialogDescription>
              Submit your leave request with required details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="leave-date"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Leave Date
                </label>
                <div className="relative">
                  {/* 👉 Popup calendar on input click */}
                  <div
                    className="relative w-full"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <DatePicker
                      id="leave-date"
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={handleOnChange}
                      placeholderText="Select date range"
                      dateFormat="dd/MM/yyyy"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      open={isCalendarOpen}
                      onClickOutside={() => setIsCalendarOpen(false)}
                      minDate={new Date()}
                    />
                  </div>
                </div>

                {/* <input
                id="from-date"
                type="date"
                className="w-full p-2 border rounded-md"
                min={new Date().toISOString().split("T")[0]}
                disabled={isLeavePending}
                {...registerLeave("fromDate", { required: "Leave date is required" })}
              />
              {leaveErrors.fromDate && (
                <p className="mt-1 text-xs text-red-500">{String(leaveErrors.fromDate.message)}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="multi-day"
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={(e) => setLeaveValue("isMultiDay", e.target.checked)}
                  disabled={isLeavePending}
                />
                <Label htmlFor="multi-day" className="text-sm">Multiple days</Label>
              </div> */}
              </div>

              {/* {watchLeave("isMultiDay") && (
              <div>
                <Label htmlFor="to-date">End Date</Label>
                <input
                  id="to-date"
                  type="date"
                  className="w-full p-2 border rounded-md"
                  min={watchLeave("fromDate") || new Date().toISOString().split("T")[0]}
                  disabled={isLeavePending}
                  {...registerLeave("toDate", { required: "End date is required for multiple days" })}
                />
                {leaveErrors.toDate && (
                  <p className="mt-1 text-xs text-red-500">{String(leaveErrors.toDate.message)}</p>
                )}
              </div>
            )} */}
            </div>

            {
              /* <div>
            <Label htmlFor="leave-type">Leave Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
                <SelectItem value="family">Family Function</SelectItem>
                <SelectItem value="medical">Medical Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div> */

              <div>
                <Label>Upload Selfie (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {/* Initial state: Show both buttons */}
                  {!leaveImagePreview && !isLeaveCameraOn ? (
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Take a selfie or upload photo
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setIsLeaveCameraOn(true);
                            setLeaveImageMode("selfie");
                            setLeaveImagePreview(null);
                            setLeaveValue("file", null);
                          }}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  ) : /* Camera mode: Show webcam and capture button */
                  isLeaveCameraOn && !leaveImagePreview ? (
                    <>
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-[300px] h-[200px] object-cover rounded-xl border mx-auto"
                      />
                      <div className="flex gap-2 mt-2 justify-center">
                        <Button type="button" onClick={captureLeavePhoto}>
                          Capture
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsLeaveCameraOn(false);
                            setLeaveImageMode("upload");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : /* Upload mode: Show file input */
                  leaveImageMode === "upload" && !leaveImagePreview ? (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  ) : /* Preview state: Show captured/uploaded image */
                  leaveImagePreview ? (
                    <>
                      <img
                        src={leaveImagePreview}
                        alt="Captured selfie"
                        className="w-[300px] h-[200px] object-cover rounded-xl border mx-auto"
                      />
                      <div className="flex gap-2 mt-2 justify-center">
                        <Button type="button" onClick={retakeLeavePhoto}>
                          Retake
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setLeaveImagePreview(null);
                            setLeaveValue("file", null);
                            setIsLeaveCameraOn(false);
                            setLeaveImageMode("selfie");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLeaveValue("file", file);
                      setLeaveImagePreview(URL.createObjectURL(file));
                      setLeaveImageMode("upload");
                      setIsLeaveCameraOn(false);
                    }
                    e.target.value = null;
                  }}
                  className="hidden"
                  id="leave-selfie-upload"
                />

                {/* Preview section for uploaded files */}
                {/* {leaveImagePreview && leaveImageMode === 'upload' && (
              <div className="mt-4 text-center space-y-3">
                <img
                  src={leaveImagePreview}
                  alt="Selected image"
                  className="w-32 h-32 object-cover rounded-lg border mx-auto"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLeaveImagePreview(null);
                      setLeaveValue("file", null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )} */}
              </div>
            }
          </div>

          <div>
            <Label htmlFor="leave-reason">Reason for Leave</Label>
            <Textarea
              id="leave-reason"
              placeholder="Please provide detailed reason for your leave request..."
              rows={3}
              disabled={isLeavePending}
              {...registerLeave("reason", { required: "Reason is required" })}
            />
            {leaveErrors.reason && (
              <p className="mt-1 text-xs text-red-500">
                {String(leaveErrors.reason.message)}
              </p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Emergency Contact</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For urgent leaves, contact: Manager (+91 9876543210)
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApplyingLeave(false)}
              disabled={isLeavePending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLeaveSubmit(onSubmitLeave)}
              disabled={isLeavePending}
            >
              {isLeavePending && (
                <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
              )}
              <FileText className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Mark your attendance and manage leave requests
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-medium">
            {new Date()?.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Dialog
                open={isMarkingAttendance}
                onOpenChange={(open) => {
                  if (!open && isCreatePending) {
                    return; // Prevent closing when create is pending
                  }
                  setIsMarkingAttendance(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-primary"
                    // disabled={hasMarkedToday}
                  >
                    Mark Attendance
                  </Button>
                </DialogTrigger>
                <AttendanceMarkModal
                  localImagePreview={localImagePreview}
                  setLocalImagePreview={setLocalImagePreview}
                />
              </Dialog>

              <Dialog open={isApplyingLeave} onOpenChange={setIsApplyingLeave}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Apply Leave
                  </Button>
                </DialogTrigger>
                <LeaveApplicationModal
                  leaveImagePreview={leaveImagePreview}
                  setLeaveImagePreview={setLeaveImagePreview}
                />
              </Dialog>
            </div>
            {/* Removed right-side quick metrics per request */}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Attendance Summary
              </CardTitle>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTodaySummaryPending ? (
              <MonthlyAttendanceSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">
                    {todaySummary?.payload?.attendance?.present ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warning">
                    {todaySummary?.payload?.attendance?.leave ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Leave</p>
                </div>
                <div className="text-center p-4 bg-danger/5 border border-danger/20 rounded-lg">
                  <XCircle className="h-8 w-8 text-danger mx-auto mb-2" />
                  <p className="text-2xl font-bold text-danger">
                    {todaySummary?.payload?.attendance?.absent ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isPending ? (
              <AttendanceRecordsSkeleton />
            ) : attendanceData?.length <= 0 ? (
              <NoData
                icon={UserCheck}
                title="No Attendance Available"
                description="There is no attendance, mark your attendance"
              />
            ) : (
              attendanceData?.map((record) => (
                <div
                  key={record?._id}
                  className="grid grid-cols-3 p-3 border rounded-lg"
                >
                  <div className="col-span-2 flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        record.status === "present"
                          ? "bg-success/10 text-success border-success"
                          : record.status === "leave"
                          ? "bg-warning/10 text-warning"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {record.status === "present" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : record.status === "leave" ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(record.checkInAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            weekday: "short",
                          }
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <b className="text-gray-800">Check-In Time</b>:{" "}
                        {record.status === "present" &&
                          record.checkInAt &&
                          new Date(record.checkInAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            }
                          )}
                      </p>
                      {record.notes && <NotesDisplay notes={record.notes} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-7 justify-end">
                    <Badge
                      variant="outline"
                      className={`${
                        record?.status === "present"
                          ? "bg-green-100 border border-green-300 hover:bg-green-200"
                          : record.status === "leave"
                          ? "bg-yellow-100 border border-yellow-300 hover:bg-yellow-200"
                          : "bg-red-100 border border-red-300 hover:bg-red-200"
                      }`}
                    >
                      {record?.status?.charAt(0)?.toUpperCase() +
                        record?.status?.slice(1)}
                    </Badge>
                    {record.selfieUrl && (
                      <img
                        src={record.selfieUrl}
                        alt="Attendance Snapshot"
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;

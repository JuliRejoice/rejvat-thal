import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type AttendanceFormMode = "create" | "edit";

type AttendanceFormProps = {
    defaultValues?: any;
    onSubmit?: (data: any) => void;
    isPending?: boolean;
    onCancel?: () => void;
    mode?: AttendanceFormMode;
    showRestaurantSelector?: boolean;
}

export function AttendanceForm({
    defaultValues,
    onSubmit,
    isPending,
    onCancel,
    mode = "create",
}: AttendanceFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            contactPerson: "",
            phone: "",
            wallet: "",
            description: "",
            address: "",
            ...defaultValues,
        },
        mode: "onSubmit",
    });
    const internalSubmit = (data: any) => {
        onSubmit(data);
    };
    return (
        <form onSubmit={handleSubmit(internalSubmit)}>
            <Card className="shadow-none">
                <CardContent className="space-y-6 pt-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex gap-3 items-baseline">
                                <Label htmlFor="name">Vendor Name</Label>
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name.message as string}
                                    </p>
                                )}
                            </div>
                            <Input
                                id="name"
                                placeholder="Enter vendor name"
                                {...register("name", {
                                    required: "Vendor name is required",
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-3 items-baseline">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                {errors.contactPerson && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.contactPerson.message as string}
                                    </p>
                                )}
                            </div>
                            <Input
                                id="contactPerson"
                                placeholder="Enter contact person name"
                                maxLength={40}
                                {...register("contactPerson", {
                                    required: "Contact person is required",
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-3 items-baseline">
                                <Label htmlFor="phone">Phone Number</Label>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone.message as string}
                                    </p>
                                )}
                            </div>
                            <Input
                                id="phone"
                                placeholder="Enter phone number"
                                {...register("phone", {
                                    required: "Phone number is required",
                                })}
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-3 items-baseline">
                                <Label htmlFor="email">Email</Label>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email.message as string}
                                    </p>
                                )}
                            </div>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                })}
                                placeholder="Enter email address"
                                maxLength={55}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-3 items-baseline">
                                <Label htmlFor="wallet">Due Amount</Label>
                                {errors.wallet && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.wallet.message as string}
                                    </p>
                                )}
                            </div>
                            <Input
                                id="wallet"
                                type="text"
                                {...register("wallet", {
                                    pattern: {
                                        value: /^[0-9]*\.?[0-9]*$/, 
                                        message: "Please enter a valid number"
                                    },
                                })}
                                placeholder="Enter due amount"
                                inputMode="decimal"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-3 items-baseline">
                            <Label htmlFor="address">Description</Label>
                            {errors.description && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.description.message as string}
                                </p>
                            )}
                        </div>
                        <Textarea
                            id="description"
                            placeholder="Enter description"
                            {...register("description", {
                                required: "Description is required",
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-3 items-baseline">
                            <Label htmlFor="address">Address</Label>
                            {errors.address && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.address.message as string}
                                </p>
                            )}
                        </div>
                        <Textarea
                            id="address"
                            placeholder="Enter vendor address"
                            {...register("address", {
                                required: "Address is required",
                            })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button disabled={isPending}>
                            {isPending ? "Processing..." : mode === "edit" ? 'Update Vendor' : 'Save Vendor'}
                        </Button>
                        <Button variant="outline" onClick={onCancel} disabled={isPending}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

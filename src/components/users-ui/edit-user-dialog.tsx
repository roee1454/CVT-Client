import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRecord } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { axiosClient } from "@/lib/axios";

interface EditUserDialogProps {
    selectedUser: Partial<UserRecord>,
    open: boolean,
    onOpenChange: (open: boolean) => any
}

const editUserSchema = z.object({
    fullName: z.string(),
    username: z.string(),
    role: z.string().refine(role => ["admin", "tech", "user"].includes(role)),
    active: z.boolean()
})

type EditUserValues = z.infer<typeof editUserSchema>

export default function EditUserDialog({ selectedUser, open, onOpenChange }: EditUserDialogProps) {
    
    const client = useQueryClient();

    const { mutateAsync } = useMutation({
        mutationKey: ['users', selectedUser.id],
        mutationFn: async (values: EditUserValues) => {
            await axiosClient.put(`/users/${selectedUser.id}`, { ...values })
        },
        onSuccess: () => {
            toast.success("פרטי משתמש עודכנו בהצלחה!")
            client.refetchQueries<string[]>({ queryKey: ['users'] })
            client.refetchQueries<string[]>({ queryKey: ['user'] })
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error("נכשל בעת עדכון פרטי משתמש, נסו שוב מאוחר יותר.")
            console.error(error)
            throw new Error(error.message)
        }
    })

    const { user } = useAuth();
    
    const form = useForm<EditUserValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            fullName: selectedUser.fullName || "",
            username: selectedUser.username || "",
            role: selectedUser.role || "user",
            active: selectedUser.active || false,
        }
    });

    // Reset form when selectedUser changes
    useEffect(() => {
        if (selectedUser) {
            form.reset({
                fullName: selectedUser.fullName || "",
                username: selectedUser.username || "",
                role: selectedUser.role || "user",
                active: selectedUser.active || false,
            });
        }
    }, [selectedUser, form]);

    async function handleSubmit(values: EditUserValues) {
        // Mutation here...
        if (user?.role !== "admin" && values.role === "admin") {
            toast.error("נכשל, לא ניתן לסווג לרמת מנהל כאשר אתה טכנאי.")
            return;
        }

        await mutateAsync(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        עריכת פרטים
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField 
                            name="fullName" 
                            control={form.control} 
                            render={({ field }) => (
                                <FormItem className="py-4">
                                    <FormLabel>שם מלא</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        
                        <FormField 
                            name="username" 
                            control={form.control} 
                            render={({ field }) => (
                                <FormItem className="pb-4">
                                    <FormLabel>שם משתמש</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        
                        <FormField 
                            name="role" 
                            control={form.control} 
                            render={({ field }) => (
                                <FormItem className="pb-4">
                                    <FormLabel>סיווג</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="בחר סיווג" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">משתמש רגיל</SelectItem>
                                                <SelectItem value="tech">טכנאי</SelectItem>
                                                { user?.role === "admin" && <SelectItem value="admin">מנהל</SelectItem> }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        
                        <FormField 
                            name="active" 
                            control={form.control} 
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2 pb-4">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange} 
                                        />
                                    </FormControl>
                                    <FormLabel>האם המשתמש פעיל?</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        
                        <Button type="submit" className="w-full">סיום עריכה</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
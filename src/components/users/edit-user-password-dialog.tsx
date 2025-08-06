import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRecord } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { axiosClient } from "@/lib/axios";

interface PasswordResetDialogProps {
    selectedUser: Partial<UserRecord>,
    open: boolean,
    onOpenChange: (open: boolean) => any
}

export const passwordResetSchema =  z.object({
  newPassowrd: z.string({ message: "נדרש להקליד סיסמא" }).min(2, { message: "סיסמא קצרה מידי" }).max(30 ,{ message: "סיסמא ארוכה מידי" })
})


type PasswordResetValues = z.infer<typeof passwordResetSchema>

export default function PasswordResetDialog({ selectedUser, open, onOpenChange }: PasswordResetDialogProps) {
    
    const client = useQueryClient();

    const { mutateAsync } = useMutation({
        mutationKey: ['users', selectedUser.id],
        mutationFn: async (values: PasswordResetValues) => {
            await axiosClient.put(`/auth/password-reset/${selectedUser.id}`, { ...values })
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
    
    const form = useForm<PasswordResetValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            newPassowrd: ""
        }
    });

    // Reset form when selectedUser changes
    useEffect(() => {
        if (selectedUser) {
            form.reset({
                newPassowrd: ""
            });
        }
    }, [selectedUser, form]);

    async function handleSubmit(values: PasswordResetValues) {
        // Mutation here...
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
                            name="newPassowrd" 
                            control={form.control} 
                            render={({ field }) => (
                                <FormItem className="py-4">
                                    <FormLabel>סיסמא חדשה</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        
                        <Button type="submit" className="w-full">שינוי סיסמא</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
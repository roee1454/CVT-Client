import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Mail, Key, User, UserCircle, PersonStandingIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

interface AuthDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => any 
}

interface AuthFormProps {
    changeForm: () => any;
    onSuccess: () => any;
}

export const createUserDtoSchema = z.object({
    fullName: z.string(),
    email: z.string().email("כתובת מייל לא תקינה"),
    username: z.string().min(2, { message: "שם משתמש קצר מידי" }).max(30, { message: "שם משתמש ארוך מידי" }),
    hash: z.string({ message: "נדרש להקליד סיסמא" }).min(2, { message: "סיסמא קצרה מידי" }).max(30 ,{ message: "סיסמא ארוכה מידי" })
})

export const loginUserDtoSchema = z.object({
    email: z.string().email("כתובת מייל לא תקינה"),
    hash: z.string({ message: "נדרש להקליד סיסמא" }).min(2, { message: "סיסמא קצרה מידי" }).max(30 ,{ message: "סיסמא ארוכה מידי" })
})

function RegisterForm(props: AuthFormProps) {
    const form = useForm({
        resolver: zodResolver(createUserDtoSchema),
        defaultValues: { fullName: "", username: "", email: "", hash: "", }
    });

    const [loading, setLoading] = useState<boolean>(false);

    const { register } = useAuth();

    async function handleSubmit(values: z.infer<typeof createUserDtoSchema>) {
        setLoading(true)
        try {
            await register(values);
            props.onSuccess()
        } catch (err: any) {
            toast.error("נראה שלא הצלחת ליצור משתמש🤓👆")
            throw new Error(err.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form { ...form }>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem className="py-6">
                        <div className="flex flex-row items-center gap-2">
                            <PersonStandingIcon className="w-5 h-5" />
                            <FormLabel>שם מלא</FormLabel>
                        </div>
                        
                        <FormControl>
                            <Input { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />             
                <FormField name="username" control={form.control} render={({ field }) => (
                    <FormItem className="pb-6">
                        <div className="flex flex-row items-center gap-2">
                            <UserCircle className="w-5 h-5" />
                            <FormLabel>שם משתמש</FormLabel>
                        </div>
                        
                        <FormControl>
                            <Input { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />             
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem className="pb-6">
                        <div className="flex flex-row items-center gap-2">
                            <Mail className="w-5 h-5" />
                            <FormLabel>כתובת מייל</FormLabel>
                        </div>
                        <FormControl>
                            <Input { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="hash" control={form.control} render={({ field }) => (
                    <FormItem className="pb-6">
                        <div className="flex flex-row items-center gap-2">
                            <Key className="w-5 h-5"  />
                            <FormLabel>סיסמא</FormLabel>
                        </div>
                        <FormControl>
                            <Input type="password" { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Label onClick={props.changeForm} className="cursor-pointer underline">חשבון קיים? היכנס מכאן</Label>
                <Button disabled={loading} className="w-full mt-4">{ loading ? "טוען..." : "הרשמה" }</Button>
            </form>
        </Form>
    )
}

function LoginForm(props: AuthFormProps) {
    const form = useForm({
        resolver: zodResolver(loginUserDtoSchema),
        defaultValues: { email: "", hash: "", }
    });

    const [loading, setLoading] = useState<boolean>(false);
    const { login } = useAuth();

    async function handleSubmit(values: z.infer<typeof loginUserDtoSchema>) {
        setLoading(true)
        try {
            await login(values);
            props.onSuccess()
        } catch (err: any) {
            toast.error("נראה שלא הצלחת להתחבר🤓👆")
            throw new Error(err.message)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form { ...form }>
            <form onSubmit={form.handleSubmit(handleSubmit)}>        
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem className="pb-6">
                        <div className="flex flex-row items-center gap-2">
                            <Mail className="w-5 h-5" />
                            <FormLabel>כתובת מייל</FormLabel>
                        </div>
                        <FormControl>
                            <Input { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="hash" control={form.control} render={({ field }) => (
                    <FormItem className="pb-6">
                        <div className="flex flex-row items-center gap-2">
                            <Key className="w-5 h-5"  />
                            <FormLabel>סיסמא</FormLabel>
                        </div>
                        <FormControl>
                            <Input type="password" { ...field }></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Label onClick={props.changeForm} className="cursor-pointer underline">אין לך חשבון? היכנס מכאן</Label>
                <Button disabled={loading} className="w-full mt-4">{ loading ? "טוען..." : "כניסה" }</Button>
            </form>
        </Form>
    )
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
    const [login, setLogin] = useState<boolean>(true);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span>כניסה למערכת</span>
                    </DialogTitle>
                </DialogHeader>
                { login ? <LoginForm changeForm={() => setLogin(false)} onSuccess={() => {
                    toast.success("ברוך הבא!")
                    onOpenChange(false);
                }} /> : <RegisterForm changeForm={() => setLogin(true)} onSuccess={() => {
                    toast.success("ברוך הבא!")
                    onOpenChange(false);
                }} /> }
            </DialogContent>
        </Dialog>
    )
}
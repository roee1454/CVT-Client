import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EditUserDialog from "@/components/users-ui/edit-user-dialog";
import PasswordResetDialog from "@/components/users-ui/edit-user-password-dialog";
import { useAuth } from "@/context/auth-context";
import { axiosClient } from "@/lib/axios"
import { UserRecord } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader, UserCircle, Clipboard, Pencil, Trash2, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {

    const [selectedUser, setSelectedUser] = useState<Partial<UserRecord>>({});
    const [editOpen, setEditOpen] = useState(false);
    const [passwordResetOpen, setPasswordResetOpen] = useState(false);
    const { user: currentUser } = useAuth();

    function handleCopyToClipboard(text: string) {
        if (!navigator.clipboard) {
            toast.error("לא יכול להעתיק ללוח, יש לספק הרשאות דפדפן");
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            toast.success("הועתק ללוח בהצלחה!", {
                icon: <Clipboard className="h-4 w-4" />
            });
        });
    }

    function getRoleBadge(role: string) {
        switch (role) {
            case "admin": 
                return (
                    <Badge variant={"default"}>מנהל</Badge>
                )
            case "tech":
                return (
                    <Badge variant={"secondary"}>טכנאי</Badge>
                )
            default:
                return (
                    <Badge variant={"outline"}>משתמש רגיל</Badge>
                )
        }
    }

    const client = useQueryClient()

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axiosClient.get("/users");
            return response.status === 200 ? response.data as UserRecord[] : []; 
        },
    })

    const { mutateAsync: deleteUserAsync } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (id: string) => {
            await axiosClient.delete(`/users/${id}`);
        },
        onSuccess: () => {
            toast.success("פרטי משתמש נמחקו בהצלחה.");
            client.refetchQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error("נכשל בעת מחיקה של פרטי משתמש");
            console.error(error);
            throw new Error(error.message);
        }
    })

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center gap-4">
                <Loader className="w-6 h-6 animate-spin" />
                <p>טוען נתונים...</p>
            </div>
        )
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return <div className="w-full h-full container mx-auto p-6 space-y-8">
        <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">ניהול משתמשים</h1>
                <p className="text-muted-foreground">ערוך ונהל את פרטי המשתמשים שלך.</p>
        </div>
        <Card className="w-full">
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle className="flex flex-row items-center gap-2">
                        <UserCircle className="w-6 h-6" />
                        <p>טבלת ניהול משתמשים</p>
                    </CardTitle>
                    <CardDescription>מאפשרת ניהול מלא של כל משתמשי האתר</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">מזהה ייחודי</TableHead>
                            <TableHead className="text-right">שם מלא</TableHead>
                            <TableHead className="text-right">כתובת מייל</TableHead>
                            <TableHead className="text-right">תאריך יצירה</TableHead>
                            <TableHead className="text-right">סיווג</TableHead>
                            <TableHead className="text-center">פעולות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="text-right">
                                    <span className="font-mono text-sm">{user.id.substring(0, 12)}</span>
                                    <Button 
                                        onClick={() => handleCopyToClipboard(user.id)} 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                    >
                                        <Clipboard className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">{user.fullName}</TableCell>
                                <TableCell className="text-right">{user.email}</TableCell>
                                <TableCell className="text-right">{new Date(user.createdAt).toLocaleDateString("he", { dateStyle: "long" })}</TableCell>
                                <TableCell className="text-right">{getRoleBadge(user.role)}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-row justify-center items-center gap-2">
                                        <Button onClick={() => {
                                            setSelectedUser(user)
                                            setPasswordResetOpen(true)
                                        }} className={buttonVariants({
                                            variant: "default",
                                            size: "icon",
                                            className: "rounded-full"
                                            })}>
                                            <Key className="w-6 h-6" />
                                        </Button>
                                        <Button onClick={() => {
                                            setSelectedUser(user);
                                            setEditOpen(true);
                                        }} className={buttonVariants({
                                            variant: "secondary",
                                            size: "icon",
                                            className: "rounded-full"
                                            })}>
                                            <Pencil className="w-6 h-6 " />
                                        </Button>
                                        <Button onClick={async () => await deleteUserAsync(user.id)} disabled={user.id === currentUser?.id} className={buttonVariants({
                                            variant: "destructive",
                                            size: "icon",
                                            className: "rounded-full"
                                            })}>
                                            <Trash2 className="w-6 h-6 " />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <EditUserDialog open={editOpen} onOpenChange={setEditOpen} selectedUser={selectedUser} />
        <PasswordResetDialog open={passwordResetOpen} onOpenChange={setPasswordResetOpen} selectedUser={selectedUser} />
    </div>
}
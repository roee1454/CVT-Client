import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "../ui/table";
import { Loader2, Pencil, Plus, RefreshCcw, Trash, User2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Member } from "@/types";
import { useState } from "react";
import MembersDialog from "./members-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MembersAPI } from "./members-api";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";

interface MembersTableProps {
    members: Member[] | undefined,
    isLoading: boolean,
    error: unknown,
    refetch: () => any
}

export default function MembersTable({ members, isLoading, error, refetch }: MembersTableProps) {
    
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const onOpenChange = (open: boolean) => {
        setOpen(open)
        if (editingMember) setEditingMember(null);
    }

    const client = useQueryClient()

    const { mutateAsync: deleteAsync } = useMutation({
        mutationKey: ['delete-member'],
        mutationFn: MembersAPI.delete,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['members'] })
            toast.success("חייל נמחק בהצלחה");
        },
        onError: (error) => {
            console.error(error);
            toast.error("נכשל בעת מחיקת החייל.")
        }
    })

    if (isLoading) {
        return <div className="flex flex-col justify-center items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>טוען נתונים...</p>
        </div>
    }

    if (error) {
        return (
            <Alert className="w-full" variant={"destructive"}>
                <AlertTitle>שגיאה בעת טעינת נתוננים</AlertTitle>
                <AlertDescription>
                    <Button onClick={() => refetch()} className="group flex flex-row items-center gap-2" variant={"default"}>
                        <span>נסה שוב</span>
                        <RefreshCcw className="w-5 h-5 group-hover:animate-spin" />
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div>
            <Card className='h-[400px]'>
                <CardHeader>
                    <div className='flex flex-row justify-between items-center gap-2'>
                        <CardTitle className='flex flex-row items-center gap-2'>
                            <User2Icon className='w-5 h-5' />                 
                            <span>כוח אדם רלוונטי להיום</span>       
                        </CardTitle>
                        <Button onClick={() => setOpen(true)} className='flex flex-row items-center gap-2'>
                            <span>הוסף חייל</span>
                            <Plus className='w-5 h-5' />
                        </Button>
                    </div>
                </CardHeader>    
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <Table dir="rtl">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">שם</TableHead>
                                    <TableHead className="text-right">צוות</TableHead>
                                    <TableHead className="text-right">דרגה</TableHead>
                                    <TableHead className="text-right">זמן עד לשחרור</TableHead>
                                    <TableHead className="text-center">פעולות</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members && members.length < 1 && (
                                    <TableRow>
                                        <TableCell><div className="text-muted-foreground py-2">נראה שאין חיילים בסד"כ כרגע...</div></TableCell>
                                    </TableRow>
                                )}
                                {members && members.length > 0 && members.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell className="text-right">{member.name}</TableCell>
                                        <TableCell className="text-right">{member.team ? member.team : "לא ידוע"}</TableCell>
                                        <TableCell className="text-right">{member.rank || "לא ידוע"}</TableCell>
                                        <TableCell className="text-right">{new Date(member.leaveDate).toLocaleDateString("he", { dateStyle: "long" }) !== "Invalid Date" ? new Date(member.leaveDate).toLocaleDateString("he", { dateStyle: "long" }) : "לא ידוע"}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-4">
                                            <Button onClick={() => {
                                                setEditingMember(member);
                                                setOpen(true)
                                            }} variant={"outline"} size={"icon"} className="rounded-full">
                                                <Pencil className="w-6 h-6" />
                                            </Button>
                                            <Button onClick={async () => await deleteAsync(member.id)} variant={"destructive"} size={"icon"} className="rounded-full">
                                                <Trash className="w-6 h-6" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
           <MembersDialog editingMember={editingMember} open={open} onOpenChange={onOpenChange} /> 
        </div>
    )
};
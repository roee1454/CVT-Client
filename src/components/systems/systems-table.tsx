import { useState } from "react";
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableCell, TableRow } from '@/components/ui/table'
import { systemAPI, System } from "./systems-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, FileOutput, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import SystemDialog from "./systems-dialog";
import { toast } from "sonner";

export default function SystemTable() {
    const [editingSystem, setEditingSystem] = useState<System | null>(null)
    const [open, setOpen] = useState<boolean>(false);

    const queryClient = useQueryClient();
    
    const { data: systems, isLoading, error } = useQuery({
        queryKey: ['system'],
        queryFn: systemAPI.getAllSystems
    })

    const deleteMutation = useMutation({
        mutationFn: systemAPI.deleteSystem,
        onSuccess: () => {
            toast.success("מערכת נמחקה בהצלחה")
            queryClient.invalidateQueries({ queryKey: ['system'] });
        }
    })

    const handleEdit = (item: System) => {
        setEditingSystem(item);
        setOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingSystem(null);
        setOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setOpen(open);
        if (!open) {
            setEditingSystem(null);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center">טוען נתונים...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center text-destructive">שגיאה בטעינת הנתונים</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex flex-row items-center gap-2">
                            <FileOutput className="w-5 h-5" />
                            טבלת מערכות
                        </CardTitle>
                        <CardDescription>
                            {systems?.length === 0 ? 'אין תוכנות רשומות' : `${systems?.length} מערכות רשומות`}
                        </CardDescription>
                    </div>
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        הוסף מערכת
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {systems?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        אין מערכות להצגה. הוסף תוכנה חדשה על ידי לחיצה על הכפתור למעלה.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">כותרת</TableHead>
                                <TableHead className="text-right">תיאור</TableHead>
                                <TableHead className="text-right">אנשי קשר</TableHead>
                                <TableHead className="text-center">פעולות</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {systems?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="truncate" title={item.descripion}>
                                            {item.descripion}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.contacts.slice(0, 2).map((contact, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {contact.name}
                                                </Badge>
                                            ))}
                                            {item.contacts.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{item.contacts.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(item.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <SystemDialog 
                editingSystem={editingSystem}
                open={open}
                onOpenChange={handleDialogClose}
            />
        </Card>
    )

}
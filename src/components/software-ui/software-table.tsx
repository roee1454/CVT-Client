import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileOutput } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import SoftwareDialog from "./software-dialog";
import { Software, softwareApi } from "./software-api";

export default function SoftwareTable() {
    const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    
    const { data: software = [], isLoading, error } = useQuery({
        queryKey: ['software'],
        queryFn: softwareApi.getSoftware
    });

    const deleteMutation = useMutation({
        mutationFn: softwareApi.deleteSoftware,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['software'] });
        }
    });

    const handleEdit = (item: Software) => {
        setEditingSoftware(item);
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingSoftware(null);
        setDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setEditingSoftware(null);
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
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex flex-row items-center gap-2">
                                <FileOutput className="w-5 h-5" />
                                טבלת תוכנות
                            </CardTitle>
                            <CardDescription>
                                {software.length === 0 ? 'אין תוכנות רשומות' : `${software.length} תוכנות רשומות`}
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNew} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            הוסף תוכנה
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {software.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            אין תוכנות להצגה. הוסף תוכנה חדשה על ידי לחיצה על הכפתור למעלה.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">כותרת</TableHead>
                                    <TableHead className="text-right">תיאור</TableHead>
                                    <TableHead className="text-right">URL</TableHead>
                                    <TableHead className="text-right">אנשי קשר</TableHead>
                                    <TableHead className="text-center">פעולות</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {software.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="truncate" title={item.description}>
                                                {item.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline truncate block max-w-xs"
                                            >
                                                {item.url}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.contacts.slice(0, 2).map((contact, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {contact}
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
            </Card>

            <SoftwareDialog 
                editingSoftware={editingSoftware}
                open={dialogOpen}
                onOpenChange={handleDialogClose}
            />
        </>
    );
}
import AddGuidesDialog from "@/components/guides/add-guides-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { axiosClient } from "@/lib/axios";
import { Guides } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FilePenLine, FileX, Loader2, Plus, RefreshCcw, Trash2, Download, Eye, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GuidesPage() {

    const [open, setOpen] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const client = useQueryClient();

    const { mutateAsync: deleteMutation, isPending: isDeletePending } = useMutation({
        mutationKey: ['guides'],
        mutationFn: async (fileId: string) => {
            await axiosClient.delete(`/files/${fileId}`);
        },
        onSuccess: () => {
            client.refetchQueries({ queryKey: ['guides'] })
            toast.success("קובץ נמחק בהצלחה")
        },
        onError: (error) => {
            toast.error("נכשל בעת מחיקת קובץ")
            console.error(error)
        }
    })

    const { mutateAsync: bulkDeleteMutation, isPending: isBulkDeletePending } = useMutation({
        mutationKey: ['guides-bulk-delete'],
        mutationFn: async (fileIds: string[]) => {
            await Promise.all(fileIds.map(id => axiosClient.delete(`/files/${id}`)));
        },
        onSuccess: () => {
            client.refetchQueries({ queryKey: ['guides'] })
            setSelectedFiles([]);
            toast.success(`${selectedFiles.length} קבצים נמחקו בהצלחה`)
        },
        onError: (error) => {
            toast.error("נכשל בעת מחיקת קבצים")
            console.error(error)
        }
    })
    
    const { data: guides, isLoading, isError, refetch, error } = useQuery<Guides>({
        queryKey: ['guides'],
        queryFn: async () => {
            const response = await axiosClient.get("/files/guides");
            return response.status === 200 ? response.data as Guides : { total: 0, files: [] };
        }
    })

    const handleSelectAll = (checked: boolean) => {
        if (checked && guides?.files) {
            setSelectedFiles(guides.files.map(file => file.id));
        } else {
            setSelectedFiles([]);
        }
    };

    const isAllSelected = guides?.files && guides?.files?.length > 0 && selectedFiles.length === guides.files.length;

    const handleSelectFile = (fileId: string, checked: boolean) => {
        if (checked) {
            setSelectedFiles(prev => [...prev, fileId]);
        } else {
            setSelectedFiles(prev => prev.filter(id => id !== fileId));
        }
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        if (selectedFiles.length === 0) return;
        
        if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedFiles.length} קבצים? פעולה זו לא ניתנת לביטול.`)) {
            await bulkDeleteMutation(selectedFiles);
        }
    };

    const handleBulkDownload = () => {
        if (selectedFiles.length === 0) return;
       
        const link = document.createElement("a");
        link.download = "all-files.zip"
        link.href = `${axiosClient.getUri()}/files/download/dir/guides`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`מתחיל הורדה של ${selectedFiles.length} קבצים`);
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg">טוען קבצי הדרכה קיימים..</p>
            </div>
        )
    }

    if (isError) {
        console.error(error);
        return (
            <div className="w-full flex flex-col justify-center items-center p-6">
                <Alert variant={"destructive"}>
                    <AlertCircle />
                    <AlertTitle>שגיאה בעת טעינת פרויקטים קיימים</AlertTitle>
                    <AlertDescription>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                יכול לקרות עקב חוסר בהרשאות או בגלל בעיות תשתית.
                            </p>
                            <Button onClick={() => refetch()} className="flex items-center">
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                נסה שוב
                            </Button>
                    </AlertDescription>
                    
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">ניהול ספרות והדרכה</h1>
                <p className="text-muted-foreground">הוסף, מחק ונהל את כלל הקבצי ההדרכה באתר</p>
            </div>
            
            {selectedFiles.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{selectedFiles.length} קבצים נבחרו</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleBulkDownload}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    הורד הכל
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={isBulkDeletePending}
                                    className="flex items-center gap-2"
                                >
                                    {isBulkDeletePending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    מחק הכל
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedFiles([])}
                                >
                                    בטל בחירה
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="w-full">
                <CardHeader className="w-full flex justify-between items-center">
                    <div>
                        <CardTitle className="flex flex-row items-center gap-2">
                            <FilePenLine className="w-6 h-6" />
                            <p>טבלת ניהול קבצי ספרות והדרכה</p>
                        </CardTitle>
                        <CardDescription>מאפשרת ניהול מלא כל קבצי ההדרכה באתר</CardDescription>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <span className="flex flex-row items-center gap-2">
                            <span>הוסף קבצים</span>
                            <Plus className="w-5 h-5 text-white" />
                        </span>
                    </Button>
                </CardHeader>
                <CardContent>
                    {guides?.files && guides.files.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="text-right">מזהה ייחודי</TableHead>
                                    <TableHead className="text-right">שם קובץ</TableHead>
                                    <TableHead className="text-right">משקל</TableHead>
                                    <TableHead className="text-right">תאריך העלאה</TableHead>
                                    <TableHead className="text-center">פעולות</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {guides.files.map(file => (
                                    <TableRow 
                                        key={file.id}
                                        className={selectedFiles.includes(file.id) ? "bg-blue-50" : ""}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedFiles.includes(file.id)}
                                                onCheckedChange={(checked) => 
                                                    handleSelectFile(file.id, checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">{file.id}</TableCell>
                                        <TableCell className="text-right">
                                            <span title={file.originalName}>
                                                {file.originalName.length > 20 
                                                    ? `${file.originalName.substring(0, 20)}...` 
                                                    : file.originalName
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{ file.size / 1024 < 1000 ? (file.size / 1024).toFixed(1) : (file.size / 1024 / 1024).toFixed(1)} {(file.size / 1024) < 1000 ? "KB" : "MB"}</TableCell>
                                        <TableCell className="text-right">{new Date(file.uploadedAt).toLocaleDateString("he", { dateStyle: "long" })}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-row justify-center items-center gap-2">
                                                <Button
                                                    variant="default"
                                                    size="icon"
                                                    className="rounded-full"
                                                    onClick={() => {
                                                        window.open(`${axiosClient.getUri()}/files/download/${file.id}`);
                                                    }}
                                                    title="הורד קובץ"
                                                >
                                                    <DownloadIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-full"
                                                    onClick={() => {
                                                        window.open(`${axiosClient.getUri()}/files/view/${file.id}`, '_blank');
                                                    }}
                                                    title="צפה בקובץ"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    onClick={() => deleteMutation(file.id)} 
                                                    disabled={isDeletePending}
                                                    className={buttonVariants({
                                                        variant: "destructive",
                                                        size: "icon",
                                                        className: "rounded-full"
                                                    })}
                                                    title="מחק קובץ"
                                                >
                                                    {isDeletePending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <FileX className="w-12 h-12 text-destructive" />
                            <p className="text-muted-foreground">לא אוחסנו קבצים במאגר נכון לרגע זה</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <AddGuidesDialog open={open} onOpenChange={setOpen} />
        </div>
    )
}
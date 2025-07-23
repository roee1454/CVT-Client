import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormField, FormLabel, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { axiosClient } from '@/lib/axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FilePlus, Upload, File, X, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const guidesSchema = z.object({
    files: z.any().refine(files => files instanceof FileList && files.length > 0, { 
        message: "נא להעלות לפחות קובץ אחד" 
    })
})

type GuidesSchemaValues = z.infer<typeof guidesSchema>;

interface AddGuidesDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => any
}

function AddGuidesDialog({ open, onOpenChange }: AddGuidesDialogProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const client = useQueryClient()

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['guides'],
        mutationFn: async(values: GuidesSchemaValues) => {
            const formData = new FormData();
            
            Array.from(values.files).forEach((file: any) => {
                formData.append("files", file);
            });
            
            await axiosClient.post("/files/guides", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        },
        onSuccess: () => {
            form.reset()
            toast.success("קבצים הועלו בהצלחה!")
            client.refetchQueries({ queryKey: ['guides'] });
        },
        onError: (error) => {
            form.reset();
            toast.success("נכשל בעת העלאת הקבצים")
            console.error(error)
            onOpenChange(false);
        }
    })
    
    const form = useForm({
        resolver: zodResolver(guidesSchema),
        defaultValues: {
            files: undefined
        }
    })

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        
        const fileArray = Array.from(files);
        setSelectedFiles(prev => [...prev, ...fileArray]);
        
        const dt = new DataTransfer();
        [...selectedFiles, ...fileArray].forEach(file => dt.items.add(file));
        
        form.setValue('files', dt.files);
        form.clearErrors('files');
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        
        if (newFiles.length === 0) {
            form.setValue('files', undefined);
        } else {
            const dt = new DataTransfer();
            newFiles.forEach(file => dt.items.add(file));
            form.setValue('files', dt.files);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    async function handleSubmit(values: GuidesSchemaValues) {
        try {
            await mutateAsync(values);
            onOpenChange(false);
            setSelectedFiles([]);
            form.reset();
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        switch(extension) {
            case "pdf":
                return <FileText className='w-8 h-8 text-red-500' />
            case "xls":
                return <FileSpreadsheet className='w-8 h-8 text-green-500' />
            case "jpg":
                return <FileImage className='w-8 h-8 text-blue-500' />
            case "jpeg":
                return <FileImage className='w-8 h-8 text-blue-500' />
            case "png":
                return <FileImage className='w-8 h-8 text-blue-500' />
        }

        return <File className="w-8 h-8 text-blue-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        <span className='flex flex-row items-center gap-2'>
                            <FilePlus />
                            הוספת תיקיות
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="files"
                            render={() => (
                                <FormItem>
                                    <FormLabel>קבצים</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            <div
                                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                                    dragActive 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    onChange={handleChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <Upload className="w-12 h-12 text-gray-400" />
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-700">
                                                            גרור קבצים לכאן או לחץ לבחירה
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            ניתן להעלות מספר קבצים בו זמנית
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={onButtonClick}
                                                        className="mt-2"
                                                    >
                                                        בחר קבצים
                                                    </Button>
                                                </div>
                                            </div>
                                            

                                            {selectedFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-700">
                                                        קבצים נבחרים ({selectedFiles.length})
                                                    </h4>
                                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                                        {selectedFiles.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                                            >
                                                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                                                    {getFileIcon(file.name)}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {file.name.substring(0,24)}...
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatFileSize(file.size)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                ביטול
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || selectedFiles.length === 0}
                            >
                                {isPending ? 'מעלה...' : 'העלה קבצים'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddGuidesDialog;
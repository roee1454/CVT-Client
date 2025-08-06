import { toast } from "sonner";
import * as Table from '@/components/ui/table'
import { Button } from "@/components/ui/button";
import { 
  Clipboard, 
  RefreshCcw, 
  AlertCircle,
  Loader2,
  Plus,
  AlignHorizontalDistributeCenterIcon
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerRecord } from "@/types";
import { useState } from "react";
import ContainerLogsModal from "./containers-logs-modal"; 
import ContainerDialog from "./containers-dialog";
import { Software } from "../software/software-api";
import { FaDocker } from 'react-icons/fa'

interface ContainerTableProps {
    containers: ContainerRecord[],
    refetch: () => {},
    isLoading: boolean,
    isError: boolean,
    software: Software[],
    isSoftwareLoading: boolean,
    softwareError: Error | null
}

export default function ContainerTable({ containers, refetch, isLoading, isError, software, softwareError, isSoftwareLoading }: ContainerTableProps) {

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [selectedContainer, setSelectedContainer] = useState<ContainerRecord>({} as any);

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

    function handleOpenDialog() {
        setIsFormOpen(true);
    }

    if (isLoading) {
        return (
            <div className="w-full flex flex-col justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg">טוען פרויקטים קיימים..</p>
            </div>
        );
    }

    if (isError) {
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
        <div className="w-full flex flex-col">            
            <Card className="w-full shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="flex flex-row items-center gap-2">
                            <FaDocker className="w-5 h-5" />
                            טבלת קונטיינרים פעילים
                        </CardTitle>
                        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
                            קונטיינר חדש
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <Table.Table>
                        <Table.TableHeader>
                            <Table.TableRow>
                                <Table.TableHead className="w-1/5 text-right">מזהה ייחודי</Table.TableHead>
                                <Table.TableHead className="w-1/5 text-right">תוכנה</Table.TableHead>
                                <Table.TableHead className="w-1/5 text-right">קונטיינר</Table.TableHead>
                                <Table.TableHead className="w-1/5 text-center">פעולות</Table.TableHead>
                            </Table.TableRow>
                        </Table.TableHeader>
                        <Table.TableBody>
                            {containers?.length === 0 ? (
                                <Table.TableRow>
                                    <Table.TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        לא נמצאו קונטיינרים
                                    </Table.TableCell>
                                </Table.TableRow>
                            ) : (
                                containers?.map((container) => {
                                    return (
                                        <Table.TableRow key={container.id}>
                                            <Table.TableCell className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{container.id.substring(0, 12)}</span>
                                                    <Button 
                                                        onClick={() => handleCopyToClipboard(container.id)} 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8"
                                                    >
                                                        <Clipboard className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Table.TableCell>
                                            <Table.TableCell>{software.find(s => s.id === container.projectId)?.title}</Table.TableCell>
                                            <Table.TableCell className="font-medium text-right">
                                                {container.name}
                                            </Table.TableCell>
                                            <Table.TableCell className="flex justify-center">
                                                <Button variant={"secondary"} className="flex flex-row justify-center items-center gap-2" onClick={() => {
                                                    setSelectedContainer(container);
                                                    setOpen(true);
                                                }}>
                                                    <AlignHorizontalDistributeCenterIcon className="w-5 h-5" />
                                                    חלון שליטה
                                                </Button>
                                            </Table.TableCell>
                                        </Table.TableRow>
                                    );
                                })
                            )}
                        </Table.TableBody>
                    </Table.Table>
                </CardContent>
            </Card>
            <ContainerDialog open={isFormOpen} onOpenChange={setIsFormOpen} error={softwareError} isLoading={isSoftwareLoading} software={software} />
            <ContainerLogsModal open={open} onOpenChange={() => setOpen(!open)} container={selectedContainer} endpoint={`http://localhost:4000/docker/container/build-logs/${selectedContainer?.buildId}` } />
        </div>
    );
}

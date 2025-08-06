import { Team, TeamsAPI } from './teams-api';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Plus, RefreshCcw, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { FaPeopleArrows } from 'react-icons/fa';
import { useState } from 'react';
import TeamsDialog from './teams-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ScrollArea } from '../ui/scroll-area';
import { usePeople } from '@/context/people-context';

interface TeamsTableProps {
    teams: Team[] | undefined,
    isLoading: boolean,
    error: unknown,
    refetch: () => any
}

export default function TeamsTable({ teams, isLoading, error, refetch }: TeamsTableProps) {
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const client = useQueryClient();

    const { mutateAsync: deleteAsync } = useMutation({
        mutationKey: ['delete-team'],
        mutationFn: TeamsAPI.delete,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['teams'] })
            toast.success("צוות נמחק בהצלחה");
        },
        onError: () => {
            toast.error("נככשל במחיקת הצוות")
        }
    })

    const { members } = usePeople();
    
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
                            <FaPeopleArrows className='w-5 h-5' />                 
                            <span>צוותים קיימים</span>       
                        </CardTitle>
                        <Button onClick={() => setOpen(true)} className='flex flex-row items-center gap-2'>
                            <span>צוות חדש</span>
                            <Plus className='w-5 h-5' />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent dir='rtl'>
                    <ScrollArea className='h-[300px]'>
                        <Table dir='rtl'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-right'>שם צוות</TableHead>
                                <TableHead className='text-right'>מספר חיילים</TableHead>
                                <TableHead className='text-center'>פעולות</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teams && teams.length < 1 && (
                                <TableRow>
                                    <TableCell>
                                        <div className='text-muted-foreground py-2'>נראה שאין צוותים בסד"כ כרגע...</div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {teams && teams.length > 0 && teams.map(team => (
                                <TableRow key={team.id}>
                                    <TableCell className='text-right'>{team.name}</TableCell>
                                    <TableCell>{ members && members.filter(member => member.team === team.name).length }</TableCell>
                                    <TableCell className="flex flex-row justify-center items-center gap-4">
                                        <Button onClick={() => {
                                            setEditingTeam(team)
                                            setOpen(true)
                                        }} variant={"outline"} size={"icon"} className="rounded-full">
                                            <Pencil className="w-6 h-6" />
                                        </Button>
                                        <Button onClick={async () => await deleteAsync(team.id)} variant={"destructive"} size={"icon"} className="rounded-full">
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
            <TeamsDialog open={open} onOpenChange={setOpen} editingTeam={editingTeam} />
        </div>
    )
}
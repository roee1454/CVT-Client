import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamsAPI, teamSchema } from './teams-api';
import { Team, TeamValues } from './teams-api';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TeamsFormProps {
    onSuccess: () => any,
    editingTeam: Team | null
}

export default function TeamsForm(props: TeamsFormProps) {       
    const form = useForm<TeamValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: props.editingTeam?.name ?? "",
            teamLead: props.editingTeam?.teamLead ?? ""
        }
    })

    const client = useQueryClient();

    const { mutateAsync: createAsync, isPending: createPending } = useMutation({
        mutationKey: ['create-team'],
        mutationFn: TeamsAPI.insert,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['teams'] })
            toast.success("הצוות נוצר בהצלחה")
            props.onSuccess()
        },
        onError: () => {
            form.reset();
            toast.error("נכשל בעת יצירת צוות!");
        }
    });

    const { mutateAsync: updateAsync, isPending: updatePending } = useMutation({
        mutationKey: ['update-team'],
        mutationFn: async (values: TeamValues) => await TeamsAPI.update(props.editingTeam?.id!, values),
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['teams'] })
            toast.success("הצוות עודכן בהצלחה")
            props.onSuccess();
        },
        onError: () => {
            form.reset();
            toast.error("נכשל בעת עדכון הצוות!");
        }
    })

    async function handleSubmit(values: TeamValues) {
        if (props.editingTeam) {
            await updateAsync(values);
        } else {
            await createAsync(values);
        }
    }
    
    return (
        <Form { ...form }>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField name='name' control={form.control} render={({ field }) => (
                    <FormItem className='py-2'>
                        <FormLabel>שם הצוות</FormLabel>
                        <FormControl>
                            <Input { ...field } />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField name='teamLead' control={form.control} render={({ field }) => (
                    <FormItem className='py-2'>
                        <FormLabel>ראש צוות</FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className='w-full' dir='rtl'>
                                    <SelectValue placeholder="בחר ראש צוות" />
                                </SelectTrigger>
                                <SelectContent></SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button disabled={updatePending || createPending} className='w-full'>
                    <span className='flex flex-row items-center gap-2'>{ props.editingTeam ? "ערוך פרטי צוות" : "צור צוות" } <span>{ updatePending || createPending && <Loader2 className='w-5 h-5 animate-spin' /> }</span></span>
                </Button>
            </form>
        </Form>
    )
}
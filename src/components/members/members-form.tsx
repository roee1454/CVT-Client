import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Member } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { he } from 'date-fns/locale'
import { MembersAPI, memberSchema, MemberValues } from './members-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePeople } from '@/context/people-context'


interface MembersFormProps {
    onSuccess: () => any
    editingMember: Member | null
}

export default function MembersForm({ onSuccess, editingMember }: MembersFormProps) {
    const form = useForm<MemberValues>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: editingMember?.name ?? '',
            email: editingMember?.email ?? "",
            phoneNum: editingMember?.phoneNum ?? '',
            ad: editingMember?.ad ?? "",
            rank: editingMember?.rank ?? "",
            team: editingMember?.team ?? "",
            leaveDate: editingMember?.leaveDate ?? new Date(),
        }
    })

    const client = useQueryClient();

    const { mutateAsync: createMutation, isPending: createPending } = useMutation({
        mutationKey: ['create-member'],
        mutationFn: MembersAPI.create,
        onError() { toast.error("נכשל בעת הוספת חייל לכוח אדם") },
        onSuccess() { 
            client.invalidateQueries({ queryKey: ['members'] })
            toast.success("חייל נוסף לכוח אדם בהצלחה")
            onSuccess() 
        }
    })

    const { mutateAsync: updateMutation, isPending: updatePending } = useMutation({
        mutationKey: ['update-member'],
        mutationFn: async (values: MemberValues) => await MembersAPI.update(editingMember?.id!, values),
        onError() { toast.error("נכשל בלעדכן את פרטי החייל") },
        onSuccess() {
            client.invalidateQueries({ queryKey: ['members'] })
            toast.success("פרטי החייל עודכנו בהצלחה");
            onSuccess();
        }
    })

    const { teams } = usePeople();

    async function handleSubmit(values: MemberValues) {
        console.log(values)
        if (editingMember) {
            // Update current member...
            await updateMutation(values);
        } else { 
            // Create a new member...
            await createMutation(values);
        }
        onSuccess();
    }

    return (
        <Form {...form}>
            <form className='py-2' onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>שם מלא</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>כתובת מייל</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="phoneNum" control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>מספר טלפון</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="ad" control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>מספר אישי</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name='rank' control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>דרגה</FormLabel>
                        <FormControl>
                            <Select dir='rtl' value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="בחר דרגה" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="טוראי">טוראי</SelectItem>
                                    <SelectItem value={`רב"ט`}>רב"ט</SelectItem>
                                    <SelectItem value='סמל'>סמל</SelectItem>
                                    <SelectItem value={`סמ"ר`}>סמ"ר</SelectItem>
                                    <SelectItem value={`רב סמל`}>רב סמל</SelectItem>
                                    <SelectItem value={`סגם`}>סגם</SelectItem>
                                    <SelectItem value={`סגן`}>סגן</SelectItem>
                                    <SelectItem value={`סרן`}>סרן</SelectItem>
                                    <SelectItem value={`רס"ן`}>רס"ן</SelectItem>
                                    <SelectItem value={`מילואים`}>מילואים</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name='team' control={form.control} render={({ field }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>צוות</FormLabel>
                        <FormControl>
                            <Select dir='rtl' value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="בחר צוות" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams && teams.length > 0 && teams.map(team => (
                                        <SelectItem value={team.name}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )} />
                <FormField name='leaveDate' control={form.control} render={({ field  }) => (
                    <FormItem className='pb-2'>
                        <FormLabel>תאריך שחרור</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger className='w-full'>
                                    <Button
                                        type='button'
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 w-full text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? format(field.value, "PPP") : <span>בחר תאריך</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        captionLayout="dropdown"
                                        autoFocus
                                        dir='rtl'
                                        lang='he'
                                        locale={he}
                                        startMonth={new Date(new Date(Date.now()).getFullYear(), 0)}
                                        endMonth={new Date(new Date(Date.now()).getFullYear() + 6, 0)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button disabled={createPending || updatePending} className='w-full'><span className='flex flex-row items-center gap-2'>{editingMember ? "עדכן פרטי חייל" : "הוסף חייל למערכת"}<span>{ createPending || updatePending && <Loader2 className='w-5 h-5 animate-spin' /> }</span></span></Button>
            </form>
        </Form>
    )
}
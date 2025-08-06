import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Software, SoftwareFormData, softwareSchema, softwareApi } from "./software-api";
import { Label } from "../ui/label";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { axiosClient } from "@/lib/axios";
import { AspectRatio } from "../ui/aspect-ratio";

export default function SoftwareForm({ editingSoftware, onSuccess }: { 
    editingSoftware?: Software | null, 
    onSuccess?: () => void 
}) {
    const queryClient = useQueryClient();
    const [contactInput, setContactInput] = useState('');
    
    const form = useForm<SoftwareFormData>({
        resolver: zodResolver(softwareSchema),
        defaultValues: {
            title: editingSoftware?.title || '',
            description: editingSoftware?.description || '',
            url: editingSoftware?.url || '',
            contacts: editingSoftware?.contacts || [],
            image: null
        }
    });

    const createMutation = useMutation({
        mutationFn: softwareApi.createSoftware,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['software'] });
            form.reset();
            setContactInput('');
            onSuccess?.();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: SoftwareFormData) => softwareApi.updateSoftware(editingSoftware!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['software'] });
            onSuccess?.();
        }
    });

    const addContact = () => {
        if (contactInput.trim() && contactInput.includes('@')) {
            const currentContacts = form.getValues('contacts');
            if (!currentContacts.includes(contactInput.trim())) {
                form.setValue('contacts', [...currentContacts, contactInput.trim()]);
                setContactInput('');
            }
        }
    };

    const removeContact = (contactToRemove: string) => {
        const currentContacts = form.getValues('contacts');
        form.setValue('contacts', currentContacts.filter(contact => contact !== contactToRemove));
    };

    const onSubmit = (data: SoftwareFormData) => {
        if (editingSoftware) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>כותרת</FormLabel>
                            <FormControl>
                                <Input placeholder="שם התוכנה..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>תיאור</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="תיאור התוכנה..."
                                    className="min-h-[100px] resize-none"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>כתובת URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contacts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>אנשי קשר</FormLabel>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="example@email.com"
                                        value={contactInput}
                                        onChange={(e) => setContactInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addContact())}
                                    />
                                    <Button type="button" onClick={addContact} variant="outline">
                                        הוסף
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {field.value.map((contact, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {contact}
                                            <button
                                                type="button"
                                                onClick={() => removeContact(contact)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {editingSoftware == null && (
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>תמונה של מסך הבית</FormLabel>
                            <FormControl>
                                <Input
                                id="file"
                                type="file"
                                accept=".jpg, .png, .jpeg"
                                onChange={(e) => field.onChange(e.target.files)}
                                className="hidden"
                                />
                            </FormControl>
                                {field.value === null || typeof field.value === "undefined" || typeof field.value[0] === "undefined" ? (
                                <Label htmlFor="file" className={buttonVariants({ variant: "secondary", size: "lg", className: "flex flex-col justify-center items-center p-20 bg-slate-50 border-1" })}>
                                    <PlusCircle className="w-24 h-24" />
                                    <span className="text-muted-foreground">גרור לכאן או לחץ כדי להעלות תמונה</span>
                                </Label>
                                ) : (
                                <Label htmlFor="file" className={buttonVariants({ variant: "secondary", size: "lg", className: "flex flex-col justify-center items-center p-20 bg-slate-50 border-1" })}>
                                    <RefreshCcw className="w-24 h-24" />
                                    <span className="text-muted-foreground font-bold">{field.value[0].name || "בחר תמונה"}</span>
                                    <span className="text-muted-foreground">לחץ שוב להחלפת תמונה</span>
                                    
                                </Label>
                                )}
                            <FormDescription className="text-xs">
                                תמונה של מסך הבית של התוכנה שתוצג בכרטיסיה באתר
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                )}

                {editingSoftware !== null && (
                    <AspectRatio ratio={16 / 10}>
                        <img className="w-full h-full" src={`${axiosClient.getUri()}/files/view/${editingSoftware?.imageId}`}></img>
                    </AspectRatio>
                )}

                <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full"
                >
                    {(createMutation.isPending || updateMutation.isPending) ? 'שומר...' : 
                     editingSoftware ? 'עדכן' : 'הוסף תוכנה'}
                </Button>
            </form>
        </Form>
    );
}


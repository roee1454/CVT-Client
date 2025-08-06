import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { systemAPI, createSystemSchema, System, UpdateSystemDto, CreateSystemDto } from "./systems-api";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, User, RefreshCcw, PlusCircle, } from "lucide-react";
import { axiosClient } from "@/lib/axios";
import { AspectRatio } from "../ui/aspect-ratio";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface SystemFormProps {
    editingSystem: System | null,
    onSuccess: () => any
}

export default function SystemForm({ editingSystem, onSuccess }: SystemFormProps) {    
    const form = useForm({
        resolver: zodResolver(createSystemSchema),
        defaultValues: {
            title: editingSystem?.title || "",
            descripion: editingSystem?.descripion || "",
            contacts: editingSystem?.contacts || [],
            image: null,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts"
    });

    const queryClient = useQueryClient();

    const { mutateAsync: createSystem } = useMutation({
        mutationKey: ['create-system'],
        mutationFn: systemAPI.createSystem,
        onSuccess: () => {
            toast.success("מערכת נוצרה בהצלחה")
            queryClient.invalidateQueries({ queryKey: ['system'] });
            form.reset();
            onSuccess?.();
        }
    })

    const { mutateAsync: updateSystem } = useMutation({
        mutationKey: ['update-system'],
        mutationFn: async (data: UpdateSystemDto) => systemAPI.updateSystem(editingSystem?.id!, data),
        onSuccess: () => {
            toast.success("מערכת עודכנה בהצלחה")
            queryClient.invalidateQueries({ queryKey: ['system'] });
            form.reset();
            onSuccess?.();
        }
    })

    const onSubmit = async (data: CreateSystemDto) => {
        if (editingSystem) {
            await updateSystem(data)
        } else {
            await createSystem(data)
        }
    }

    const addContact = () => {
        append({ name: "", email: "", phoneNum: "" });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField 
                    name="title" 
                    control={form.control} 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>כותרת</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} 
                />
                
                <FormField 
                    name="descripion" 
                    control={form.control} 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>תיאור מערכת</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} 
                />
                
                {/* Compact Contacts Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">אנשי קשר</FormLabel>
                        <Button 
                            type="button" 
                            onClick={addContact}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            הוסף
                        </Button>
                    </div>
                    
                    {fields.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            <User className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">אין אנשי קשר</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-48">
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <Card dir="rtl" key={field.id} className="w-full p-3">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs font-medium">איש קשר {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    className="h-6 w-6 p-0 ml-auto text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input 
                                                                    {...field} 
                                                                    placeholder="שם"
                                                                    className="h-8 text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.email`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input 
                                                                    {...field} 
                                                                    type="email"
                                                                    placeholder="אימייל"
                                                                    className="h-8 text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.phoneNum`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input 
                                                                    {...field} 
                                                                    type="tel"
                                                                    placeholder="טלפון"
                                                                    className="h-8 text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {editingSystem == null && (
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>תמונה של המערכת</FormLabel>
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
                                    <span className="text-muted-foreground font-bold">{field.value[0].name.substring(0,24) || "בחר תמונה"}</span>
                                    <span className="text-muted-foreground">לחץ שוב להחלפת תמונה</span>
                                    
                                </Label>
                                )}
                            <FormDescription className="text-xs">
                                תמונה כללית של המערכת שתוצג באתר
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                )}

                {editingSystem !== null && (
                    <AspectRatio ratio={16 / 9}>
                        <img className="w-full h-64 rounded-md shadow-md object-cover"  src={`${axiosClient.getUri()}/files/view/${editingSystem?.imageId}`}></img>
                    </AspectRatio>
                )}

                <div className="flex justify-end space-x-2">
                    <Button type="submit">
                        {editingSystem ? "עדכן מערכת" : "צור מערכת"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
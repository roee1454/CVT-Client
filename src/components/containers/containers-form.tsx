import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, PlusCircle, RefreshCcw } from "lucide-react"
import { Software } from "../software/software-api"
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "../ui/select"
import { axiosClient } from "@/lib/axios"
import { useState } from "react"
import { Label } from "../ui/label"

const containerSchema = z.object({
  projectId: z.string().nonempty({ message: "נדרש לייחס קונטיינר לתוכנה" }),
  name: z.string().min(2, { message: "קונטיינר צריך שם שיש בו יותר מ2 אותיות" }),
  image: z.string().optional(),
  environmentVariables: z.string().optional(),
  hostPort: z.string().optional(),
  containerContent: z
    .any()
    .refine((files: FileList) => files?.length === 1, { message: 'יש לעלות תיקיה.' })
    .refine((files: FileList) => files?.[0]?.name.toLowerCase().endsWith('.tar') || files?.[0].name.toLowerCase().endsWith(".zip"), { message: 'ניתן לעלות רק קובץ zip או tar' }),
  buildId: z.string()
})

type ContainerFormValues = z.infer<typeof containerSchema>

interface ContainerFormProps {
  software: Software[],
  isLoading: boolean,
  error: Error | null,
  handleSubmit: () => any
}

export default function ContainersForm({ software, isLoading, error, handleSubmit }: ContainerFormProps) {
  const form = useForm<ContainerFormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      projectId: "",
      name: "",
      image: "alpine",
      environmentVariables: "",
      hostPort: "",
      containerContent: undefined,
      buildId: crypto.randomUUID(),
    },
  })

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const { mutateAsync: createContainerMutation } = useMutation({
    mutationKey: ["containers"],
    mutationFn: async (values: ContainerFormValues) => {
        const { containerContent, ...other } = values  
        await axiosClient.post("/docker/container/new", { ...other })
    },
    onSuccess: () => {
        toast.success("נוצר קונטיינר חדש! ניתן להיכנס לחלונית השליטה כדי לבצע פעולות ולהסתכל על תהליך הבנייה.")
        handleSubmit();
        queryClient.refetchQueries({ queryKey: ['containers'] })
    },
    onError: (error: any) => {
        toast.error("נכשל בעת יצירת הקונטיינר, יש לבדוק את הנתונים שהזנתם.")
        setLoading(false)
        throw new Error(error.message)
    }
  })

  const { mutateAsync: buildContainerMutation } = useMutation({
    mutationKey: [`containers`],
    mutationFn: async (values: ContainerFormValues) => {
      const { containerContent, ...other } = values
        const fileList = values.containerContent as FileList
        const file = fileList[0]
        const formData = new FormData()
        formData.set("file", file)
        await axiosClient.post(`/docker/container/new/build/${other.buildId}`, formData)
    },
    onSuccess: () => {
        toast.success("הקונטיינר שלך בנוי! ניתן להריץ אותו כעת ולהתחיל את הפרויקט.")
        queryClient.refetchQueries({ queryKey: ['containers'] })
    },
    onError: (error) => {
        toast.error("נכשל בעת תהליך בניית הקונטיינר, בדוק רשומות של הקונטיינר כדי למצוא שגיאות.")
        setLoading(false)
        throw new Error(error.message)
    }
  })
 
  async function onSubmit(values: ContainerFormValues) {
    setLoading(true);
    await createContainerMutation(values)
    setLoading(false);
    await buildContainerMutation(values)
  }

  if (error) {
    return <div>שגיאה בעת טעינת מידע עדכני אודות תוכנות</div>
  }

  if (isLoading) {
    return <div>טוען מידע עדכני...</div>
  }

  return (
    <div className="w-full p-2">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="projectId"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>ייחוס לתוכנה</FormLabel>
                  <FormControl className="w-full">
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue className="w-full" placeholder="בחר פרויקט" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {software?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-xs">
                      תוכנה שהקונטיינר יהיה מיוחס אלייה
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="hostPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>פורט (אופציונלי)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8080" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">הפורט שהקונטיינר שלך רץ בו</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם קונטיינר</FormLabel>
                  <FormControl>
                    <Input placeholder="my-container" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    שם ייחודי לקונטייר docker שלך
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>אימג' (אופציונלי)</FormLabel>
                  <FormControl>
                    <Input placeholder="alpine:latest" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    אימג' docker לשימוש (כברירת מחדל alpine)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="environmentVariables"
            render={({ field }) => (
              <FormItem>
                <FormLabel>משתני סביבה (אופציונלי)</FormLabel>
                <FormControl>
                  <Input placeholder="KEY1=value1, KEY2=value2" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  משתני סביבה שמפוצלים לפי פסיק
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="containerContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תוכן קונטיינר (tar או zip בלבד)</FormLabel>
                <FormControl>
                  <Input
                    id="file"
                    type="file"
                    accept=".tar, .zip"
                    onChange={(e) => field.onChange(e.target.files)}
                    className="hidden"
                  />
                </FormControl>
                  {field.value === null || typeof field.value === "undefined" || typeof field.value[0] === "undefined" ? (
                    <Label htmlFor="file" className={buttonVariants({ variant: "secondary", size: "lg", className: "flex flex-col justify-center items-center p-20 bg-slate-50 border-1" })}>
                      <PlusCircle className="w-24 h-24" />
                      <span className="text-muted-foreground">גרור לכאן או לחץ כדי להעלות תיקיה</span>
                    </Label>
                  ) : (
                    <Label htmlFor="file" className={buttonVariants({ variant: "secondary", size: "lg", className: "flex flex-col justify-center items-center p-20 bg-slate-50 border-1" })}>
                      <RefreshCcw className="w-24 h-24" />
                      <span className="text-muted-foreground font-bold">{field.value[0].name || "בחר תקייה"}</span>
                      <span className="text-muted-foreground">לחץ שוב להחלפת תיקיה</span>
                    </Label>
                  )}
                <FormDescription className="text-xs">
                  העלאת קובץ tar או zip שמכילים בתוכם את תוכן הקונטיינר
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} type="submit" className="w-full">
            {loading && (
              <div className="flex flex-row items-center gap-2">
                יוצר קונטיינר
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {!loading && <span>צור קונטיינר</span>}
          </Button>
        </form>
      </Form>
    </div>
  )
}

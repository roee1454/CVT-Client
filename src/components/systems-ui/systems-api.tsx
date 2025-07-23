import { axiosClient } from "@/lib/axios";
import z from 'zod';
import { toast } from "sonner";

export const contactSchema = z.object({
  name: z.string().min(1, "שם חייב להיות לפחות תו אחד"),
  email: z.string().email("כתובת אימייל לא חוקית"),
  phoneNum: z.string().min(5, "מספר טלפון קצר מדי"),
});

export const createSystemSchema =  z.object({
    title: z.string().min(1, "הכותרת לא יכולה להיות ריקה"),
    descripion: z.string().min(1, "התיאור לא יכול להיות ריק"),
    image: z.any({ message: "תמונה של המערכת נדרשת" }).refine(image => image instanceof FileList && image.length > 0).refine(image => image[0].name.endsWith(".png") || image[0].name.endsWith(".jpg") || image[0].name.endsWith("jpeg"), { message: "ניתן להעלות רק תמונות: png, jpg, jpeg." }).optional().nullable(),
    contacts: z.array(contactSchema).nonempty("חייב להיות לפחות איש קשר אחד"),   
})

export type Contact = z.infer<typeof contactSchema>;

export type CreateSystemDto = z.infer<typeof createSystemSchema>;
export type UpdateSystemDto = Omit<CreateSystemDto, "image">;

export interface System extends Omit<CreateSystemDto, "image"> { id: string, imageId: string };

export const systemAPI = {
    getAllSystems: async () => {
        const response = await axiosClient.get("/system/ls");
        console.log(response.data)
        return response.status === 200 ? response.data as System[] : []
    },

    createSystem: async (data: CreateSystemDto) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (key === "image") {
                    formData.set(key, value[0])
                } else if (typeof value === "object") {
                    formData.set(key, JSON.stringify(value))
                }
                else {
                    formData.set(key, value)
                }
            })
            await axiosClient.post("/system/new", formData)
        } catch (err: any) {
            toast.error("יצירת מערכת לא הצליחה")
            throw new Error(err.message);
        }
    },

    updateSystem: async (id: string, data: UpdateSystemDto) => {
        try {
            await axiosClient.put(`/system/${id}`, { ...data })
        } catch (err: any) {
            toast.error("עדכון מערכת לא הצליח.")
            throw new Error(err.message);
        }
    },

    deleteSystem: async (id: string) => {
        try {
            await axiosClient.delete(`/system/${id}`)
        } catch (err: any) {
            toast.error("מחיקת מערכת לא הצליחה.")
            throw new Error(err.message);
        }
    }
}
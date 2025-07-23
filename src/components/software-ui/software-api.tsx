import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

export const softwareSchema = z.object({
    title: z.string().min(2, { message: "כותרת צריכה להכיל לפחות 2 אותיות" }),
    description: z.string().min(5, { message: "תיאור צריך להכיל לפחות 5 אותיות" }),
    url: z.string().url({ message: "כתובת URL לא תקינה" }),
    contacts: z.array(z.string().email({ message: "כתובת אימייל לא תקינה" })).min(1, { message: "נדרש לפחות איש קשר אחד" }),
    image: z.any({ message: "תמונה של מסך הבית נדרשת" }).refine(image => image instanceof FileList && image.length > 0).refine(image => image[0].name.endsWith(".png") || image[0].name.endsWith(".jpg") || image[0].name.endsWith("jpeg"), { message: "ניתן להעלות רק תמונות: png, jpg, jpeg." }).optional().nullable()
});

export interface Software extends SoftwareFormData {
    id: string;
    imageId: string;
}

export type SoftwareFormData = z.infer<typeof softwareSchema>;

export const softwareApi = {
    getSoftware: async () => {
        const response = await axios.get("http://localhost:4000/software/ls");
        console.log(response.data)
        return response.status === 200 ? response.data as Software[] : [];
    },
    deleteSoftware: async (softwareId: string) => {
        try {
            await axios.delete(`http://localhost:4000/software/${softwareId}`);
        } catch (err: any) {
            toast.error("מחיקת תוכנה לא הצליחה")
            throw new Error(err);
        }
    },
    createSoftware: async (softwareData: SoftwareFormData) => {
        try {
            const formData = new FormData();
            Object.entries(softwareData).forEach(([key, value]) => {
                if (key === "image") {
                    formData.set(key, value[0])
                } else {
                    formData.set(key, value)
                }
            })
            await axios.post("http://localhost:4000/software/new", formData);
        } catch (err: any) {
            toast.error("יצירת תוכנה לא הצליחה")
            throw new Error(err);
        }
    },
    updateSoftware: async (softwareId: string, softwareData: SoftwareFormData) => {
        try {
            const { image, ...data } = softwareData
            await axios.put(`http://localhost:4000/software/${softwareId}`, { ...data })
        } catch (err: any) {
            toast.error("עדכון תוכנה לא הצליחה")
            throw new Error(err);
        }
    }
}
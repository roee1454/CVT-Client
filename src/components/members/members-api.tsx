import z from 'zod';
import { axiosClient } from '@/lib/axios';
import { Member } from '@/types';

export const memberSchema = z.object({
    name: z.string().min(4, { message: "לחייל צריך להיות שם" }),
    email: z.string().email("כתובת מייל לא תקינה"),
    phoneNum: z.string().regex(new RegExp(/^\+?\d{1,3}?[-.\s]?(\(?\d{1,4}\)?)[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/), "מספר טלפון לא תקין"),
    ad: z.string().min(1, { message: "נא להקליד מספר אישי" }).refine(ad => ad.length === 7 && parseInt(ad), "מספר אישי צריך להיות מורכב משבע ספרות"),
    rank: z.string().min(1, { message: "יש לבחור דרגה" }),
    leaveDate: z.date({ message: 'יש לבחור תאריך שחרור' }),
    team: z.string().min(1, { message: "נא לבחור צוות" })
})

export interface MemberValues extends z.infer<typeof memberSchema> {};

export const MembersAPI = {
    list: async () => {
        try {
            const response = await axiosClient.get('member/ls')
            return response.status === 200 ? response.data as Member[] : []
        } catch (err: any) {
            console.error(err)
        }
    },

    get: async (id: string) => {
        try {
            const response = await axiosClient.get(`member/${id}`)
            return response.status === 200 ? response.data as Member : []
        } catch (err: any) {
            console.error(err)
        }
    },

    create: async (values: MemberValues) => {
        try {
            await axiosClient.post(`member/new`, { ...values })
        } catch (err: any) {
            console.error(err)
        }
    },

    update: async (id: string, values: MemberValues) => {
        try {
            await axiosClient.put(`member/${id}`, { ...values })
        } catch (err: any) {
            console.error(err)
        }
    },

    delete: async (id: string) => {
        try {
            await axiosClient.delete(`member/${id}`)
        } catch (err: any) {
            console.error(err)
        }
    }
}
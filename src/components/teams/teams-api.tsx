import { axiosClient } from '@/lib/axios';
import { z } from 'zod';

export const teamSchema = z.object({
    name: z.string().min(1, "תן שם תקין לצוות"),
    teamLead: z.optional(z.string().min(1, "נא לבחור ראש צוות תקין"))
})

export interface TeamValues extends z.infer<typeof teamSchema> {};
export interface Team extends z.infer<typeof teamSchema> { id: string };

interface TeamsApiProps {
    list: () => Promise<Team[]>,
    get: (id: string) => Promise<Team | never[]>,
    insert: (values: TeamValues) => Promise<any>,
    update: (id: string, values: TeamValues) => Promise<any>,
    delete: (id: string) => Promise<any>
}

export const TeamsAPI: TeamsApiProps = {
    async list() {
        const response = await axiosClient.get("team/ls");
        return response.status === 200 ? response.data as Team[] : []
    },

    async get(id: string) {
        const response = await axiosClient.get(`team/${id}`)
        return response.status === 200 ? response.data as Team : []
    },

    async insert(values: TeamValues) {
        await axiosClient.post(`team/new`, { ...values });
    },
    
    async update(id: string, values: TeamValues) {
        await axiosClient.put(`team/${id}`, { ...values });
    },

    async delete(id: string) {
        await axiosClient.delete(`team/${id}`);
    },
}
import ContainerTable from "@/components/containers-ui/containers-table";
import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Software } from "@/components/software-ui/software-api";
import { ContainerRecord } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Containers() {
    const { data: software, isLoading: isSoftwareLoading, error: softwareError } = useQuery({
        queryKey: ["software"],
        queryFn: async () => {
          const response = await axiosClient.get("/software/ls");
          return response.status === 200 ? response.data as Software[] : [];
        }
    })

    const { data: containers, isLoading: isContainersLoading, refetch, isError: containerError } = useQuery({ 
        queryKey: ['containers'],
        async queryFn() {
            const response = await axiosClient.get("/docker/container/ls");
            return response.status === 200 ? response.data as ContainerRecord[] : []
        },
        refetchInterval: 10000,
        enabled: !!software
    });

    if (isSoftwareLoading || isContainersLoading) {
        return <div className="w-full flex flex-col items-center gap-2">
            <Loader2 className="w-24 h-24 animate-spin" />
            <span className="text-xl text-muted-foreground">טוען מידע..</span>
        </div>
    }

    if (containerError || softwareError) {
        return <Alert variant={"destructive"}>
            <AlertTitle>נכשל בעת טעינת מידע אודות קונטיינרים פעילים</AlertTitle>
            <AlertDescription>דבר זה יכול להיגרם עקב אי חיבור לרשת או בעיה בתשתית.</AlertDescription>
        </Alert>
    }

    return <div className="container mx-auto p-6 space-y-8">
        <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">ניהול קונטיינרים</h1>
                <p className="text-muted-foreground">הוסף, ערוך ונהל את הקונטיינרים שלך</p>
        </div>
        <div className="flex flex-col items-center space-y-8">
            <ContainerTable containers={containers!} isLoading={isContainersLoading} refetch={refetch} isError={containerError} software={software!} isSoftwareLoading={isSoftwareLoading} softwareError={softwareError} />
        </div>
    </div>
}
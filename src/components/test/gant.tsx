import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ArrowLeft } from 'lucide-react';

export interface GantProps {
    stages: GantStageProps[]
}

export function Gant(props: GantProps) {
    return (
        <div className="flex flex-row flex-wrap justify-center items-center gap-2">
            {props.stages.map((stage, idx) => {
                if (idx === props.stages.length - 1) {
                    return <GantStage { ...stage } key={idx} />
                }
                return (
                    <div className="flex flex-row items-center gap-2">
                        <GantStage { ...stage } key={idx} />
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                )
            })}
        </div>        
    )    
}

export interface GantStageProps {
    title: string;
    subtitle: string;
}

export function GantStage(props: GantStageProps) {
    return (
        <Button variant={"outline"} className={cn("min-w-24 min-h-24 skew-x-12")}>
            <span className="w-full h-full flex flex-col justify-center items-center gap-2">
                <span className="text-lg text-foreground font-bold">{props.title}</span>
                <span className="text-md text-muted-foreground">{props.subtitle}</span>
            </span>
        </Button>
    )
}
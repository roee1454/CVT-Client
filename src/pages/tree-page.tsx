import { OrgTree, TreeNodeProps } from "@/components/test-ui/tree";

const mainOrgData: TreeNodeProps = {
    label: `רמ"ד מדור הדמאה`,
    subtitle: `רס"ן עמית סיני`,
    level: 0,
    
    childrenFormation: "row",
    children: [
        {
            label: `רש"צ CVT`,
            subtitle: `איציק חבר`,
            level: 1,
            childrenFormation: "grid",
            children: [
                {
                    label: `סמ"ל רואי חיילי`,
                },
                {
                    label: `סמ"ל רועי אשל`
                },
                {
                    label: `טוראי דניאל בוני`
                },
                {
                    label: `אורי עבודי`
                },
            ]
        },
        {
            label: `רש"צ חיר ומיוחדים`,
            subtitle: `סר"ן אלירן אלמליח`,
            level: 1,
            childrenFormation: "grid",
            children: [
                {
                    label: `טוראי אליאן סיטרוק`,
                },
                {
                    label: `טוראי ירין בורשטיין`,
                },
                {
                    label: `סר"ן משה גולדשטיין`,
                },
            ]
        },
        {
            label: `רש"צ קרקע`,
            subtitle: `סר"ן יונהתן חגי`,
            level: 1,
            childrenFormation: "grid",
            children: [
                {
                    label: `רב"ט איתי קנפר`,
                },
                {
                    label: `סג"ם רמי`,
                },
                {
                    label: `סמ"ל אופק`,
                },
            ]
        },
    ]
}

export default function TreePage() {
    return <div className="w-full container mx-auto space-y-8 p-6">
         <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">מדור הדמאה</h1>
                <p className="text-muted-foreground">מבנה מדור הדמאה בעץ היררכייה</p>
        </div>
        <OrgTree data={mainOrgData} />
    </div>
}
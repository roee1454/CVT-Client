import { Gant, GantStageProps } from "@/components/test/gant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stages: GantStageProps[] = [
    {
        title: "מציאת טכנולוגיות",
        subtitle: "חקר הטכנולוגיות היעילות לפרויקט זה.",
    },
    {
        title: "בניית תשתית",
        subtitle: "להקים תשתית לשרת שעליו נבנה הפרויקט",
    },
    {
        title: "אפיון תעבורת מידע",
        subtitle: "אפיון מבנה הנתונים הרצוי לפרויקט"
    },
    {
        title: "פיתוח פרוטוטיפים",
        subtitle: "פיתוח גרסאות ראשוניות לבדיקת פונקציונליות"
    },
    {
        title: "השקה לציבור",
        subtitle: "הפצה של גרסא ראשונית למספר משתמשים מצומצם"
    }
]

export default function GantPage() {
    return <div className="w-full container mx-auto space-y-8 p-6">
        <div className="flex flex-col justify-center items-center gap-8">
            <h1 className="p-8 text-3xl font-bold">מערכת OCD</h1>
            <Gant stages={stages} />
            <div className="w-full flex flex-row justify-around items-center my-8">
                <Card className="min-w-64 min-h-64">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">אחראים על הפרויקט ותפקידים</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="">
                            <li>רואי!!</li>
                            <li>רואי!!</li>
                            <li>רואי!!</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="min-w-64 min-h-64">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">מידע על הפרויקט</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">חרא מערכת רילאבום יותר טוב</CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>        
    </div>
}
import SoftwareTable from "@/components/software-ui/software-table";

export default function SoftwarePage() {
    return (
        <div className="container mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">ניהול תוכנות</h1>
                <p className="text-muted-foreground">הוסף, ערוך ונהל את התוכנות שלך</p>
            </div>
            <SoftwareTable />
        </div>
    );
}
import SystemTable from "@/components/systems/systems-table";

export default function SystemPage() {
    return <div className="w-full h-full container mx-auto p-6 space-y-8">
        <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">ניהול מערכות</h1>
                <p className="text-muted-foreground">ערוך ונהל את פרטי המערכות הקיימות.</p>
        </div>
        <SystemTable />
    </div>
}
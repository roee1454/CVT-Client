import { Button, buttonVariants } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, User, FileArchive, Container, XCircle, Lock, FilePen, ShipWheel } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthDialog from "./auth/auth-dialog";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const navItems = [
        { label: "ניהול משתמשים", icon: User, href: "/users" },
        { label: "ספרות והדרכה", icon: FilePen, href: "/guides" },
        { label: "ניהול מערכות", icon: ShipWheel, href: "/systems" },
        { label: "ניהול תוכנות", icon: FileArchive, href: "/software" },
        { label: "ניהול קונטיינרים", icon: Container, href: "/containers" },
    ];

    const { user, isLoading, logout } = useAuth();

    return (
        <div className="w-full h-full flex flex-row justify-between items-center py-6 px-2.5 md:px-20 border-b bg-background">
            <div className="flex items-center">
                <Link to="/">
                    <img 
                        src="/logo.png" 
                        alt="CVT Logo" 
                        className="p-2 cursor-pointer hover:opacity-80 transition-opacity"  
                        width={128} 
                        height={128} 
                    />
                </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-6">
                {navItems.map((item) => {
                    if (isLoading) {
                        return <Skeleton key={item.href} className="w-32 h-12" />;
                    }
                    if (user && user.role !== "user") {
                        return (
                            <Button
                                key={item.label}
                                variant="ghost"
                                className="flex items-center space-x-2 cursor-pointer"
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </Button>
                        );
                    }
                    return (
                        <Tooltip key={item.label}>
                            <TooltipTrigger>
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-2 cursor-pointer"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>יש להירשם כטכנאי או מנהל כדי לפתוח את החלון הזה</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            <div className="hidden md:flex items-center space-x-6">
                {isLoading && <Skeleton className="w-24 h-10" />}

                {user && <div>שלום {user.fullName}</div>}

                {user && (
                    <Button
                        onClick={() => logout()}
                        variant="destructive"
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>התנתק</span>
                    </Button>
                )}

                {!isLoading && !user && (
                    <Button
                        onClick={() => setAuthOpen(true)}
                        variant="default"
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <User className="w-4 h-4" />
                        <span>כניסה</span>
                    </Button>
                )}
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className={buttonVariants({ variant: 'ghost', size: "icon", className: "md:hidden" })}>
                    <Menu className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                    <div className="flex flex-col space-y-4 mt-8">
                        <div className="space-y-2">
                            {navItems.map((item) => {
                                if (isLoading) {
                                    return <Skeleton key={item.href} className="w-full h-12" />;
                                }
                                if (user && user.role !== "user") {
                                    return (
                                        <Button
                                            key={item.label}
                                            variant="ghost"
                                            className="w-full justify-start flex items-center space-x-3"
                                            asChild
                                        >
                                            <Link to={item.href} onClick={() => setIsOpen(false)}>
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </Button>
                                    );
                                }
                                return (
                                    <Tooltip key={item.label}>
                                        <TooltipTrigger>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start flex items-center space-x-3"
                                            >
                                                <Lock className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>יש להירשם כטכנאי או מנהל כדי לפתוח את החלון הזה</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        <div className="border-t my-4" />

                        <div className="space-y-2 px-2">
                            {isLoading && <Skeleton className="w-full h-10" />}

                            {user && <div className="px-2">שלום {user.fullName}</div>}

                            {user && (
                                <Button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    variant="destructive"
                                    className="w-full flex items-center space-x-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>התנתק</span>
                                </Button>
                            )}

                            {!isLoading && !user && (
                                <Button
                                    onClick={() => {
                                        setAuthOpen(true);
                                        setIsOpen(false);
                                    }}
                                    variant="default"
                                    className="w-full flex items-center space-x-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span>כניסה</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            <AuthDialog onOpenChange={(open) => setAuthOpen(open)} open={authOpen} />
        </div>
    );
}

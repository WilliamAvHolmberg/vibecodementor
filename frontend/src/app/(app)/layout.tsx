import { AppHeader } from "@/shared/components/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppHeader />
            {children}
        </>
    );
}
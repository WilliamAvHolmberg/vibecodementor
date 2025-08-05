import { AuthGuard } from "@/features/auth";

export default function ATALayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}
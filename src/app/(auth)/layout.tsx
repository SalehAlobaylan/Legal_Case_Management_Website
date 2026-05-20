export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
            {children}
        </div>
    );
}

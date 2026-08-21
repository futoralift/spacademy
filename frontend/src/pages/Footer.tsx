export default function DashboardFooter() {
    return (
        <footer className="mt-auto border-t bg-background/95">
            <div className="text-muted-foreground mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-3 text-xs sm:px-6">
                <p>© {new Date().getFullYear()} SF Academy. All rights reserved.</p>
            </div>
        </footer>
    )
}

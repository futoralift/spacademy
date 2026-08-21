import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Check, Copy} from "lucide-react";

export default function CopyableField({
    label,
    value,
    enableCopy = false,
}: {
    label: string
    value: string
    enableCopy?: boolean
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            setCopied(false)
        }
    }

    return (
        <div className="rounded-lg border px-4 py-3">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs tracking-wide text-muted-foreground">{label}</p>
                {enableCopy && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={handleCopy}
                        aria-label={`Copy ${label}`}
                    >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>
                )}
            </div>
            <p className="mt-1 select-text text-sm font-medium wrap-break-word">{value}</p>
        </div>
    )
}
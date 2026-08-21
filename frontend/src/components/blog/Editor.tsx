import { useEffect, useRef, memo } from "react";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
// @ts-ignore
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import InlineCode from "@editorjs/inline-code";
// @ts-ignore
import Table from "@editorjs/table";
// @ts-ignore
import Quote from "@editorjs/quote";
// @ts-ignore
import Marker from "@editorjs/marker";
// @ts-ignore
import Checklist from "@editorjs/checklist";
// @ts-ignore
import Delimiter from "@editorjs/delimiter";

interface EditorProps {
    data?: OutputData;
    onChange: (data: OutputData) => void;
    placeholder?: string;
}

const EDITOR_JS_TOOLS = {
    header: Header,
    list: List,
    inlineCode: InlineCode,
    table: Table,
    quote: Quote,
    marker: Marker,
    checklist: Checklist,
    delimiter: Delimiter,
};

const Editor = ({ data, onChange, placeholder }: EditorProps) => {
    const editorRef = useRef<EditorJS | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editorRef.current && containerRef.current) {
            const editor = new EditorJS({
                holder: containerRef.current,
                tools: EDITOR_JS_TOOLS,
                data: data,
                placeholder: placeholder || "Write your story...",
                onChange: async () => {
                    const savedData = await editor.save();
                    onChange(savedData);
                },
            });

            editorRef.current = editor;
        }

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []); // Only once

    return (
        <div 
            ref={containerRef} 
            className="prose prose-sm dark:prose-invert max-w-none min-h-[300px] border rounded-md p-4 bg-background"
        />
    );
};

export default memo(Editor);

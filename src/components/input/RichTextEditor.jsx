import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const RichTextEditor = ({
    placeholder,
    label,
    className = "",
    value = "",
    onChange,
    error,
    disabled = false,
    height = "300px",
    tinymceApiKey = "mrjzg34xdadqgcqxfqjm0c1ymp23fumthj7ds61a4vlmvlrn",
    ...rest
}) => {
    const wrapperClassNames = `flex flex-col gap-2 ${className}`.trim();

    const editorClassNames = `rich-text-editor-wrapper ${error ? "rich-text-editor-error" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`.trim();

    const editorRef = useRef(null);
    const numericHeight =
        typeof height === "string" ? parseInt(height, 10) || 300 : height || 300;

    const handleEditorChange = (content) => {
        onChange?.(content);
    };

    return (
        <div className={wrapperClassNames}>
            {label && (
                <label className="text-black/50 dark:text-white/50 text-sm ml-1">
                    {label}
                </label>
            )}
            <div className={editorClassNames} style={{ height }}>
                <Editor
                    apiKey={tinymceApiKey}
                    onInit={(_evt, editor) => (editorRef.current = editor)}
                    value={value}
                    init={{
                        height: numericHeight,
                        menubar: false,
                        placeholder: placeholder || "",
                        plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "help",
                            "wordcount",
                        ],
                        toolbar:
                            "undo redo | blocks | " +
                            "bold italic underline forecolor backcolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | " +
                            "removeformat | link image table | code fullscreen",
                        branding: false,
                        content_style:
                            "body { font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px }",
                    }}
                    disabled={disabled}
                    onEditorChange={handleEditorChange}
                    {...rest}
                />
            </div>
            {error && (
                <span className="text-red-500 text-xs ml-1">{error.message}</span>
            )}
        </div>
    );
};

export default RichTextEditor;


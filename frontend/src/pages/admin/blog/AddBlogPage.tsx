import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Save, Eye, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { toast } from "sonner";
import { useCreatePostMutation, useBlogTaxonomiesQuery, useCreateTagMutation, useCreateCategoryMutation } from "@/api/contentHooks.ts";
import type { PostCreateUploadRequest } from "@/api/types.ts";
import type { OutputData } from "@editorjs/editorjs";
import Editor from "@/components/blog/Editor.tsx";
import { Field, FieldGroup } from "@/components/ui/field.tsx";
import { Separator } from "@/components/ui/separator.tsx";

export default function AddBlogPage() {
    const navigate = useNavigate();
    const createPostMutation = useCreatePostMutation();
    const taxonomyQuery = useBlogTaxonomiesQuery();
    const createTagMutation = useCreateTagMutation();
    const createCategoryMutation = useCreateCategoryMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [contentData, setContentData] = useState<OutputData>({ blocks: [] });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    const [newTagName, setNewTagName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFeaturedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFeaturedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePublish = () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        const payload: PostCreateUploadRequest = {
            title,
            content: JSON.stringify(contentData),
            excerpt,
            featuredImage,
            tagIds: selectedTags,
            categoryIds: selectedCategories,
            metaTitle,
            metaDescription,
        };

        createPostMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Blog post created successfully");
                navigate("/dashboard/admin/blogs");
            },
        });
    };

    const toggleTag = (id: string) => {
        setSelectedTags(prev => 
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        createCategoryMutation.mutate({ name: newCategoryName }, {
            onSuccess: (newCat) => {
                setSelectedCategories(prev => [...prev, newCat.id]);
                setNewCategoryName("");
                toast.success("Category created and selected");
            }
        });
    };

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        createTagMutation.mutate({ name: newTagName }, {
            onSuccess: (newTag) => {
                setSelectedTags(prev => [...prev, newTag.id]);
                setNewTagName("");
                toast.success("Tag created and selected");
            }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-card sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild aria-label="arrow-left">
                        <Link to="/dashboard/admin/blogs">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">New Blog Post</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Save className="size-4" /> Save Draft
                    </Button>
                    <Button variant="outline">
                        <Eye className="size-4" /> Preview
                    </Button>
                    <Button 
                        onClick={handlePublish}
                        disabled={createPostMutation.isPending}
                    >
                        {createPostMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
                        Publish Post
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Editor Area */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <input
                            type="text"
                            placeholder="Add Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-4xl lg:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 focus:ring-0"
                        />
                        <div className="w-full editor-container min-h-125">
                            <Editor
                                onChange={setContentData} 
                                placeholder="Start writing your masterpiece..." 
                            />
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="w-87.5 border-l bg-card overflow-y-auto p-6 hidden xl:block">
                    <div className="space-y-7">
                        {/* Summary Section */}
                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">Summary</h2>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="post-excerpt">Excerpt</Label>
                                    <Textarea 
                                        id="post-excerpt"
                                        placeholder="Brief summary..."
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="min-h-25"
                                        aria-label="Excerpt excerpt example"
                                    />
                                </Field>
                                <Field>
                                    <Label>Featured Image</Label>
                                    <div 
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="space-y-1 text-center">
                                            {imagePreview ? (
                                                <div className="relative group">
                                                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                        <p className="text-white text-xs font-medium">Change Image</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                                                    <div className="flex text-sm text-slate-600">
                                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                                            Upload a file
                                                        </span>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    {imagePreview && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="mt-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                        >
                                            <X className="size-3 mr-2" /> Remove Image
                                        </Button>
                                    )}
                                </Field>
                            </FieldGroup>
                        </section>

                        <Separator />

                        {/* Taxonomy Section */}
                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">Taxonomy</h2>
                            
                            <FieldGroup>
                                {/* Categories */}
                                <Field>
                                    <Label>Categories</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Add new..." 
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            aria-label="category name"
                                        />
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            className="h-8"
                                            onClick={handleAddCategory}
                                            disabled={createCategoryMutation.isPending}
                                        >
                                            {createCategoryMutation.isPending ? <LoaderCircle className="size-3 animate-spin" /> : <Plus className="size-3" />}
                                        </Button>
                                    </div>
                                    <FieldGroup className="max-h-37.5 overflow-y-auto p-2 border rounded-md">
                                        {taxonomyQuery.data?.categories.length ? taxonomyQuery.data.categories.map(cat => (
                                            <div key={cat.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`cat-${cat.id}`} 
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onCheckedChange={() => toggleCategory(cat.id)}
                                                />
                                                <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {cat.name}
                                                </Label>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-muted-foreground italic">No categories yet.</p>
                                        )}
                                    </FieldGroup>
                                </Field>

                                {/* Tags */}
                                <Field className="space-y-3">
                                    <Label>Tags</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Add new..." 
                                            value={newTagName}
                                            onChange={e => setNewTagName(e.target.value)}
                                            aria-label="tag name"
                                        />
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            className="h-8"
                                            onClick={handleAddTag}
                                            disabled={createTagMutation.isPending}
                                        >
                                            {createTagMutation.isPending ? <LoaderCircle className="size-3 animate-spin" /> : <Plus className="size-3" />}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-10">
                                        {taxonomyQuery.data?.tags.length ? taxonomyQuery.data.tags.map(tag => (
                                            <Button
                                                key={tag.id}
                                                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                                size="sm"
                                                className="h-7 text-[10px] px-2"
                                                onClick={() => toggleTag(tag.id)}
                                            >
                                                {tag.name}
                                            </Button>
                                        )) : (
                                            <p className="text-xs text-muted-foreground italic">No tags yet.</p>
                                        )}
                                    </div>
                                </Field>
                            </FieldGroup>
                        </section>

                        <Separator />

                        {/* SEO Section */}
                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">SEO</h2>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="meta-title">Meta Title</Label>
                                    <Input 
                                        id="meta-title"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        aria-label="meta-title"
                                    />
                                </Field>
                                <Field className="space-y-2">
                                    <Label htmlFor="meta-desc">Meta Description</Label>
                                    <Textarea 
                                        id="meta-desc"
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        aria-label="meta-desc"
                                    />
                                </Field>
                            </FieldGroup>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}

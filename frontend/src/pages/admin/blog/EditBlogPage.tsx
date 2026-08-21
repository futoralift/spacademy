import {useState, type ReactNode, useRef, type ChangeEvent} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Save, Trash, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Field, FieldGroup } from "@/components/ui/field.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { toast } from "sonner";
import {
    useUpdatePostMutation,
    useBlogTaxonomiesQuery,
    useCreateTagMutation,
    useCreateCategoryMutation,
    usePostsQuery
} from "@/api/contentHooks.ts";
import type { PostResponse, BlogPostStatus, PostUpdateUploadRequest } from "@/api/types.ts";
import type { OutputData } from "@editorjs/editorjs";
import Editor from "@/components/blog/Editor.tsx";
import { getFileUrl } from "@/api/http";

type EditPostFormState = {
    title: string;
    excerpt: string;
    featuredImageFile: File | null;
    imagePreview: string | null;
    metaTitle: string;
    metaDescription: string;
    status: BlogPostStatus;
    contentData: OutputData;
    selectedTags: string[];
    selectedCategories: string[];
};

type TaxonomySelectorProps = {
    label: string;
    inputLabel: string;
    inputValue: string;
    onInputChange: (value: string) => void;
    onCreate: () => void;
    isCreating: boolean;
    children: ReactNode;
};

function createInitialFormState(post: PostResponse): EditPostFormState {
    let contentData: OutputData;

    try {
        contentData = JSON.parse(post.content);
    } catch {
        contentData = {
            blocks: [{ type: "paragraph", data: { text: post.content || "" } }]
        };
    }

    const initialPreview = getFileUrl(post.featuredImage);

    return {
        title: post.title || "",
        excerpt: post.excerpt || "",
        featuredImageFile: null,
        imagePreview: initialPreview,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        status: post.status,
        contentData,
        selectedTags: post.tagIds || [],
        selectedCategories: post.categoryIds || [],
    };
}

function TaxonomySelector({
    label,
    inputLabel,
    inputValue,
    onInputChange,
    onCreate,
    isCreating,
    children,
}: TaxonomySelectorProps) {
    return (
        <Field className="space-y-3">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    placeholder="Add new..."
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    aria-label={inputLabel}
                />
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-8"
                    onClick={onCreate}
                    disabled={isCreating}
                    aria-label={`Create ${label.toLowerCase().slice(0, -1)}`}
                >
                    {isCreating ? <LoaderCircle className="size-3 animate-spin" /> : <Plus className="size-3" />}
                </Button>
            </div>
            {children}
        </Field>
    );
}

export default function EditBlogPage() {
    const { id } = useParams();
    const postsQuery = usePostsQuery();
    const post = postsQuery.data?.data.find((item) => item.id === id);

    if (postsQuery.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <LoaderCircle className="size-8 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <p className="text-xl font-semibold">Post not found</p>
                <Button asChild variant="outline">
                    <Link to="/dashboard/admin/blogs">Back to Posts</Link>
                </Button>
            </div>
        );
    }

    return <EditBlogForm key={post.id} post={post} />;
}

function EditBlogForm({ post }: { post: PostResponse }) {
    const navigate = useNavigate();
    const updatePostMutation = useUpdatePostMutation();
    const taxonomyQuery = useBlogTaxonomiesQuery();
    const createTagMutation = useCreateTagMutation();
    const createCategoryMutation = useCreateCategoryMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState<EditPostFormState>(() => createInitialFormState(post));
    const [newTagName, setNewTagName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");

    const {
        title,
        excerpt,
        featuredImageFile,
        imagePreview,
        metaTitle,
        metaDescription,
        status,
        contentData,
        selectedTags,
        selectedCategories,
    } = formState;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormState(prev => ({
                ...prev,
                featuredImageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const removeImage = () => {
        setFormState(prev => ({
            ...prev,
            featuredImageFile: null,
            imagePreview: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        const payload: PostUpdateUploadRequest = {
            id: post.id,
            slug: post.slug,
            title,
            content: JSON.stringify(contentData),
            excerpt,
            featuredImage: featuredImageFile,
            tagIds: selectedTags,
            categoryIds: selectedCategories,
            status,
            metaTitle,
            metaDescription,
        };

        updatePostMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Blog post updated successfully");
                navigate("/dashboard/admin/blogs");
            },
        });
    };

    const toggleTag = (id: string) => {
        setFormState((prev) => ({
            ...prev,
            selectedTags: prev.selectedTags.includes(id)
                ? prev.selectedTags.filter((tagId) => tagId !== id)
                : [...prev.selectedTags, id],
        }));
    };

    const toggleCategory = (id: string) => {
        setFormState((prev) => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(id)
                ? prev.selectedCategories.filter((categoryId) => categoryId !== id)
                : [...prev.selectedCategories, id],
        }));
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        createCategoryMutation.mutate({ name: newCategoryName }, {
            onSuccess: (newCategory) => {
                setFormState((prev) => ({
                    ...prev,
                    selectedCategories: [...prev.selectedCategories, newCategory.id],
                }));
                setNewCategoryName("");
                toast.success("Category created and selected");
            }
        });
    };

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        createTagMutation.mutate({ name: newTagName }, {
            onSuccess: (newTag) => {
                setFormState((prev) => ({
                    ...prev,
                    selectedTags: [...prev.selectedTags, newTag.id],
                }));
                setNewTagName("");
                toast.success("Tag created and selected");
            }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between px-6 py-4 border-b bg-card sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild aria-label="Go back to blog posts">
                        <Link to="/dashboard/admin/blogs">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">Edit Post</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSave}
                        disabled={updatePostMutation.isPending}
                        aria-label="Save blog post changes"
                    >
                        {updatePostMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        <Save className="mr-2 size-4" /> Save Changes
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <input
                            type="text"
                            placeholder="Add Title"
                            value={title}
                            onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full text-4xl lg:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 focus:ring-0"
                            aria-label="Post title"
                        />
                        <div className="editor-container min-h-125">
                            <Editor
                                key={post.id}
                                data={contentData}
                                onChange={(nextContent) => setFormState((prev) => ({ ...prev, contentData: nextContent }))}
                                placeholder="Edit your content..."
                            />
                        </div>
                    </div>
                </main>

                <aside className="w-87.5 border-l bg-card overflow-y-auto p-6 hidden xl:block">
                    <div className="space-y-7">
                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">Publication</h2>
                            <FieldGroup>
                                <Field>
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`size-2 rounded-full ${status === "publish" ? "bg-green-500" : "bg-yellow-500"}`} />
                                        <span className="capitalize">{status}</span>
                                        <Button
                                            variant="ghost"
                                            className="ml-auto"
                                            onClick={() => setFormState((prev) => ({
                                                ...prev,
                                                status: prev.status === "publish" ? "draft" : "publish",
                                            }))}
                                            aria-label={`Switch post status to ${status === "publish" ? "draft" : "publish"}`}
                                        >
                                            Switch to {status === "publish" ? "Draft" : "Publish"}
                                        </Button>
                                    </div>
                                </Field>
                                <Field>
                                    <Label htmlFor="post-excerpt">Excerpt</Label>
                                    <Textarea
                                        id="post-excerpt"
                                        placeholder="Brief summary..."
                                        value={excerpt}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, excerpt: e.target.value }))}
                                        className="min-h-25"
                                        aria-label="Post excerpt"
                                    />
                                </Field>
                                <Field>
                                    <Label>Featured Image</Label>
                                    <div 
                                        className="p-1 mt-1 flex justify-center border-2 border-slate-300 border-dashed rounded-xl hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="space-y-1 text-center">
                                            {imagePreview ? (
                                                <div className="relative group">
                                                    <img src={imagePreview} alt="Preview" className="aspect-video mx-auto rounded-lg object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                        <p className="text-white text-xs font-medium">Change Image</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-5">
                                                    <Upload className="mx-auto h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                                                    <div className="flex text-sm text-slate-600">
                                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                                            Upload a file
                                                        </span>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                                </div>
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
                                            className="mt-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 w-full"
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

                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">Taxonomy</h2>
                            <FieldGroup>
                                <TaxonomySelector
                                    label="Categories"
                                    inputLabel="Category name"
                                    inputValue={newCategoryName}
                                    onInputChange={setNewCategoryName}
                                    onCreate={handleAddCategory}
                                    isCreating={createCategoryMutation.isPending}
                                >
                                    <FieldGroup className="max-h-37.5 overflow-y-auto p-2 border rounded-md">
                                        {taxonomyQuery.data?.categories.length ? taxonomyQuery.data.categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category.id}`}
                                                    checked={selectedCategories.includes(category.id)}
                                                    onCheckedChange={() => toggleCategory(category.id)}
                                                    aria-label={`Select category ${category.name}`}
                                                />
                                                <Label htmlFor={`cat-${category.id}`} className="cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {category.name}
                                                </Label>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-muted-foreground italic">No categories yet.</p>
                                        )}
                                    </FieldGroup>
                                </TaxonomySelector>

                                <TaxonomySelector
                                    label="Tags"
                                    inputLabel="Tag name"
                                    inputValue={newTagName}
                                    onInputChange={setNewTagName}
                                    onCreate={handleAddTag}
                                    isCreating={createTagMutation.isPending}
                                >
                                    <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-10">
                                        {taxonomyQuery.data?.tags.length ? taxonomyQuery.data.tags.map((tag) => (
                                            <Button
                                                key={tag.id}
                                                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                                size="sm"
                                                className="h-7 text-[10px] px-2"
                                                onClick={() => toggleTag(tag.id)}
                                                aria-label={`${selectedTags.includes(tag.id) ? "Remove" : "Add"} tag ${tag.name}`}
                                            >
                                                {tag.name}
                                            </Button>
                                        )) : (
                                            <p className="text-xs text-muted-foreground italic">No tags yet.</p>
                                        )}
                                    </div>
                                </TaxonomySelector>
                            </FieldGroup>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="font-semibold text-sm tracking-wider text-muted-foreground">SEO</h2>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="meta-title">Meta Title</Label>
                                    <Input
                                        id="meta-title"
                                        value={metaTitle}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, metaTitle: e.target.value }))}
                                        aria-label="Meta title"
                                    />
                                </Field>
                                <Field className="space-y-2">
                                    <Label htmlFor="meta-desc">Meta Description</Label>
                                    <Textarea
                                        id="meta-desc"
                                        value={metaDescription}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, metaDescription: e.target.value }))}
                                        aria-label="Meta description"
                                    />
                                </Field>
                            </FieldGroup>
                        </section>

                        <Separator />

                        <section>
                            <Button
                                size="lg"
                                variant="ghost"
                                className="w-full justify-center cursor-pointer text-destructive bg-destructive/5 hover:text-destructive hover:bg-destructive/10"
                                aria-label="Move post to trash"
                            >
                                <Trash className="mr-2 size-4" /> Move to Trash
                            </Button>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}

import {type SubmitEventHandler, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { PlusIcon, Save, PlayCircle, Video, LoaderCircle, RefreshCw } from "lucide-react";
import {useSubjectsQuery, useMySubjectsQuery, useCreateLearningHubVideoMutation, useUpdateLearningHubVideoMutation} from "@/api/academyHooks.ts";
import { useCurrentUserQuery } from "@/api/authHooks.ts";
import type {LearningHubVideoResponse} from "@/api";
import {toast} from "sonner";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

interface AddVideoFormProps {
    videoToEdit?: LearningHubVideoResponse;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function AddVideoForm({ videoToEdit, open: externalOpen, onOpenChange: setExternalOpen }: AddVideoFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;

    const { data: user } = useCurrentUserQuery();
    const isAdmin = user?.role === 'admin';

    const { data: allSubjects } = useSubjectsQuery();
    const { data: mySubjects } = useMySubjectsQuery();
    const subjectsData = isAdmin ? allSubjects : mySubjects;

    const createMutation = useCreateLearningHubVideoMutation();
    const updateMutation = useUpdateLearningHubVideoMutation();

    // Form states
    const [title, setTitle] = useState(videoToEdit?.title || "");
    const [youtubeLink, setYoutubeLink] = useState(videoToEdit?.youtubeLink || "");
    const [videoType, setVideoType] = useState<string>(videoToEdit?.videoType || "educational_explanation");
    const [publishDate, setPublishDate] = useState(
        videoToEdit?.publishDate
            ? new Date(videoToEdit.publishDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16)
    );
    const [subjectId, setSubjectId] = useState(videoToEdit?.subjectId || "");
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleYoutubeUrlChange = async (url: string) => {
        setYoutubeLink(url);
        const videoId = extractVideoId(url);

        if (videoId) {
            // Only auto-fetch if creating a new video or title is explicitly empty
            if (!videoToEdit || !title) {
                setIsFetchingMetadata(true);
                try {
                    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
                    const data = await response.json();
                    if (data.title) {
                        setTitle(data.title);
                        toast.info("Auto-filled video details");
                    }
                } catch (error) {
                    console.error("Failed to fetch YouTube metadata:", error);
                } finally {
                    setIsFetchingMetadata(false);
                }
            }
        }
    };

    const videoIdPreview = extractVideoId(youtubeLink);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                title,
                youtubeLink,
                videoType: videoType as any,
                publishDate: new Date(publishDate).toISOString(),
                subjectId: (subjectId === "" || subjectId === "none") ? null : subjectId,
            };

            if (videoToEdit) {
                await updateMutation.mutateAsync({ ...payload, id: videoToEdit.id });
                toast.success("Video updated successfully");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("Video added to Learning Hub");
            }
            setOpen(false);
            if (!videoToEdit) {
                setTitle("");
                setYoutubeLink("");
                setVideoType("educational_explanation");
                setSubjectId("");
            }
        } catch (error: any) {
            toast.error(error?.message || (videoToEdit ? "Failed to update video" : "Failed to add video"));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!videoToEdit && (
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <PlusIcon className="size-4" />
                        Add New Video
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-bold text-xl">
                        {videoToEdit ? <Video className="size-5 text-primary" /> : <PlayCircle className="size-5 text-red-600" />}
                        {videoToEdit ? "Edit Video Details" : "Add YouTube Video"}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details below to {videoToEdit ? "update" : "publish"} a video in the Learning Hub.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field>
                        <Label htmlFor="youtube-link">YouTube URL</Label>
                        <div className="relative">
                            <Input
                                id="youtube-link"
                                value={youtubeLink}
                                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                                className="pr-10"
                                aria-label="refresh"
                            />
                            {isFetchingMetadata && (
                                <RefreshCw className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                    </Field>

                    {videoIdPreview && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={`https://img.youtube.com/vi/${videoIdPreview}/maxresdefault.jpg`}
                                alt="Thumbnail Preview"
                                className="size-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoIdPreview}/hqdefault.jpg`;
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <PlayCircle className="size-10 text-white/80 shadow-2xl" />
                            </div>
                        </div>
                    )}

                    <Field>
                        <Label htmlFor="video-title">Video Title</Label>
                        <Input
                            id="video-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a catchy title..."
                            required
                            aria-label="title"
                        />
                    </Field>

                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <Label>Category</Label>
                            <Select value={videoType} onValueChange={setVideoType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="educational_explanation">Explanation</SelectItem>
                                    <SelectItem value="short_concept">Short Concept</SelectItem>
                                    <SelectItem value="exam_preparation_guidance">Exam Guidance</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="publish-date">Publish Date</Label>
                            <Input
                                id="publish-date"
                                type="datetime-local"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                required
                                aria-label="publish-date"
                            />
                        </Field>
                    </FieldGroup>

                    <Field>
                        <Label>Subject (Optional)</Label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Global (No Subject)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Global (No Subject)</SelectItem>
                                {subjectsData?.map((subject: any) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="gap-2"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    {videoToEdit ? "Update Video" : "Publish Video"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

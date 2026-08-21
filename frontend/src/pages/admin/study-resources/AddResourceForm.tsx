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
import { PlusIcon, Save, FileText, LoaderCircle, UploadCloud } from "lucide-react";
import {
    useCreateStudyResourceMutation,
    useUpdateStudyResourceMutation,
    useSubjectsQuery,
    useMySubjectsQuery,
    useLecturesQuery
} from "@/api/academyHooks.ts";
import { useCurrentUserQuery } from "@/api/authHooks.ts";
import type { StudyResourceResponse } from "@/api/types.ts";
import { toast } from "sonner";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

interface AddResourceFormProps {
    resourceToEdit?: StudyResourceResponse;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function AddResourceForm({ resourceToEdit, open: externalOpen, onOpenChange: setExternalOpen }: AddResourceFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;

    const createMutation = useCreateStudyResourceMutation();
    const updateMutation = useUpdateStudyResourceMutation();
    const { data: user } = useCurrentUserQuery();
    const isAdmin = user?.role === 'admin';

    const { data: allSubjects } = useSubjectsQuery();
    const { data: mySubjects } = useMySubjectsQuery();
    const subjectsData = isAdmin ? allSubjects : mySubjects;

    const { data: lecturesData } = useLecturesQuery();

    // Form states
    const [title, setTitle] = useState(resourceToEdit?.title || "");
    const [description, setDescription] = useState(resourceToEdit?.description || "");
    const [subjectId, setSubjectId] = useState(resourceToEdit?.subjectId || "");
    const [lectureId, setLectureId] = useState(resourceToEdit?.lectureId || "none");
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (!resourceToEdit && !file) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            const payload = {
                title,
                description,
                subjectId: (subjectId === "" || subjectId === "none") ? null : subjectId,
                lectureId: lectureId === "none" ? null : lectureId,
                file: file as File, // In update, backend might require re-upload if logic says so
            };

            if (resourceToEdit) {
                await updateMutation.mutateAsync({ ...payload, id: resourceToEdit.id });
                toast.success("Resource updated successfully");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("Resource uploaded successfully");
            }
            setOpen(false);
            if (!resourceToEdit) {
                setTitle("");
                setDescription("");
                setSubjectId("");
                setLectureId("");
                setFile(null);
            }
        } catch (error: any) {
            toast.error(error?.message || (resourceToEdit ? "Failed to update resource" : "Failed to upload resource"));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!resourceToEdit && (
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <PlusIcon className="size-4" />
                        Add Study Resource
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {resourceToEdit ? <FileText className="size-6" /> : <UploadCloud className="size-6 text-primary" />}
                        {resourceToEdit ? "Edit Resource Details" : "Upload Study Resource"}
                    </DialogTitle>
                    <DialogDescription>
                        {resourceToEdit ? "Modify administrative metadata for the file." : "Select a lecture and subect to associate with this resource."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field>
                        <Label htmlFor="resource-title">Resource Title</Label>
                        <Input
                            id="resource-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. 10th Maths Chapter 1 Notes"
                            required
                            aria-label="resource-title"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="resource-desc">Description</Label>
                        <Input
                            id="resource-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed notes covering all concepts..."
                            required
                            aria-label="description"
                        />
                    </Field>

                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <Label>Subject</Label>
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
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

                        <Field>
                            <Label>Lecture (Optional)</Label>
                            <Select value={lectureId} onValueChange={setLectureId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select lecture" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Independent Resource (No Lecture)</SelectItem>
                                    {lecturesData?.data?.map((lecture: any) => (
                                        <SelectItem key={lecture.id} value={lecture.id}>
                                            {new Date(lecture.startDate).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>

                    <Field>
                        <Label htmlFor="resource-file">{resourceToEdit ? "Change File (Replacement)" : "Resource File"}</Label>
                        <Input
                            id="resource-file"
                            type="file"
                            required={!resourceToEdit}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            aria-label="Resource File"
                        />
                    </Field>

                    <DialogFooter className="pt-4">
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
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    {resourceToEdit ? "Update Resource" : "Upload Resource"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { type TeacherResponse, useDeleteTeacherMutation, useUpdateSubjectMutation, queryClient, queryKeys, type SubjectResponse } from "@/api";
import { Button } from "@/components/ui/button.tsx";
import {
    LoaderCircle,
    Phone,
    ShieldCheck,
    Trash2, UserRound,
    Library,
    BookOpen,
    X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import CopyableField from "@/components/CopyableField.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import AssignSubjectModal from "./AssignSubjectModal";

const formatDateTime = (value: string | null) => {
    if (!value) {
        return "Never"
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value))
}

const formatAuthProvider = (value: TeacherResponse["authServiceProvider"]) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const profileRows = (teacher: TeacherResponse) => [
    {
        title: "Teacher Details",
        icon: UserRound,
        items: [
            { label: "Email", value: teacher.email },
            { label: "Phone Number", value: teacher.phone },
        ],
    },
    {
        title: "Account Status",
        icon: ShieldCheck,
        items: [
            { label: "Auth Provider", value: formatAuthProvider(teacher.authServiceProvider) },
            { label: "Joined On", value: formatDateTime(teacher.createdAt) },
            { label: "Last Login", value: formatDateTime(teacher.lastLoginAt) },
            { label: "Deleted At", value: teacher.deletedAt ? formatDateTime(teacher.deletedAt) : "Active" },
        ],
    },
]

export default function TeacherActions({ teacher }: { teacher: TeacherResponse }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [subjectToRemove, setSubjectToRemove] = useState<SubjectResponse | null>(null)
    const deleteTeacherMutation = useDeleteTeacherMutation()
    const updateSubjectMutation = useUpdateSubjectMutation()
    const fullName = `${teacher.firstName} ${teacher.lastName}`

    const handleRemoveSubject = async () => {
        if (!subjectToRemove) return
        try {
            await updateSubjectMutation.mutateAsync({
                ...subjectToRemove,
                teacherId: null,
            })
            setSubjectToRemove(null)
            toast.success("Subject removed from teacher successfully.")

            await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all })
            await queryClient.invalidateQueries({ queryKey: ["subjects"] })
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to remove subject."
            toast.error(message)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteTeacherMutation.mutateAsync(teacher.id)
            setIsDeleteDialogOpen(false)
            toast.success("Teacher deleted successfully.")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete teacher."
            toast.error(message)
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Drawer direction="right">
                <DrawerTrigger asChild>
                    <Button variant="outline" className="capitalize">
                        View Profile
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="ml-auto h-full w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl">
                    <DrawerHeader className="gap-4 border-b px-6 py-5 text-left">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16 rounded-2xl">
                                    <AvatarImage src={teacher.avatar} alt={fullName} />
                                    <AvatarFallback className="rounded-2xl text-lg font-semibold">
                                        {`${teacher.firstName[0]?.toUpperCase() ?? ""}${teacher.lastName[0]?.toUpperCase() ?? ""}`}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <DrawerTitle className="text-2xl">{fullName}</DrawerTitle>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                            <Phone className="mr-1 size-3.5" />
                                            {teacher.phone}
                                        </Badge>
                                        <Badge variant="outline">
                                            <ShieldCheck className="mr-1 size-3.5" />
                                            {formatAuthProvider(teacher.authServiceProvider)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-dashed">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <BookOpen className="size-4" />
                                        Associated Courses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {teacher.courses.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.courses.map((course) => (
                                                <Badge key={course.id} variant="secondary" className="rounded-full px-3 py-1 font-normal font-sans tracking-wide">
                                                    {course.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No associated courses for this teacher.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-dashed">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-dashed border-b-border/40">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Library className="size-4" />
                                        Subjects Teaching
                                    </CardTitle>
                                    <div className="mt-0">
                                        <AssignSubjectModal teacherId={teacher.id} alreadyTeachingIds={teacher.subjects.map(s => s.id)} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm pt-4">
                                    {teacher.subjects.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.subjects.map((subject) => (
                                                <Badge key={subject.id} variant="outline" className="flex items-center gap-1 rounded-full pl-3 pr-1 py-1 font-normal font-sans tracking-wide">
                                                    {subject.name}
                                                    <div
                                                        className="h-4 w-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                                        onClick={() => setSubjectToRemove(subject)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </div>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No subjects teaching by this teacher.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-4 grid gap-4">
                            {profileRows(teacher).map((section) => {
                                const Icon = section.icon

                                return (
                                    <Card key={section.title}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Icon className="size-4" />
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-3 sm:grid-cols-2">
                                            {section.items.map((item) => (
                                                <CopyableField
                                                    key={item.label}
                                                    label={item.label}
                                                    value={item.value}
                                                    enableCopy={item.label === "Phone Number" || item.label === "Email"}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-between">
                        <Dialog open={!!subjectToRemove} onOpenChange={(open) => !open && setSubjectToRemove(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Remove subject?</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to remove <span className="font-semibold text-foreground">{subjectToRemove?.name}</span> from {fullName}?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSubjectToRemove(null)} disabled={updateSubjectMutation.isPending}>Cancel</Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleRemoveSubject}
                                        disabled={updateSubjectMutation.isPending}
                                    >
                                        {updateSubjectMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                        Confirm Remove
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" disabled={deleteTeacherMutation.isPending}>
                                    <Trash2 className="mr-2 size-4" />
                                    Delete User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete teacher?</DialogTitle>
                                    <DialogDescription>
                                        This will remove {fullName} from the teacher list. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={deleteTeacherMutation.isPending}>Cancel</Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleteTeacherMutation.isPending}
                                    >
                                        {deleteTeacherMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                        Confirm Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

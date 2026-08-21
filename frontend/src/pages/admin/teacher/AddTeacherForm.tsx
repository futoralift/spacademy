import {useState, type SubmitEventHandler} from "react";
import {Plus} from "lucide-react";

import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useCreateTeacherMutation} from "@/api/userHooks.ts";
import type {UserRequest} from "@/api/types.ts";

export default function AddTeacherForm() {
    const [open, setOpen] = useState(false);
    const createTeacherMutation = useCreateTeacherMutation();

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload: UserRequest = {
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            password: String(formData.get("password") ?? ""),
        };

        createTeacherMutation.mutate(payload, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus/> Add Teacher</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add Teacher</DialogTitle>
                    <DialogDescription>
                        Add a new teacher account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" name="firstName" placeholder="Enter first name" required aria-label="first-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" name="lastName" placeholder="Enter last name" required aria-label="last-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="Enter teacher email" required aria-label="email" />
                        </Field>
                        <Field>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="Enter teacher phone number" required aria-label="phone" />
                        </Field>
                        <Field className="sm:col-span-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" required aria-label="password" />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={createTeacherMutation.isPending}
                        >
                            {createTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                        </Button>
                    </DialogFooter>
                    {createTeacherMutation.isError && (
                        <p className="text-sm text-destructive">
                            {createTeacherMutation.error.message}
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}

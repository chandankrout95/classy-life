
"use client";

import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface EditProfileHeaderProps {
    onCancel: () => void;
    onDone: () => void;
    isSaving: boolean;
}

export function EditProfileHeader({ onCancel, onDone, isSaving }: EditProfileHeaderProps) {
    return (
        <header className="flex justify-between items-center p-4 border-b border-zinc-800">
            <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isSaving}
            >
                Cancel
            </Button>
            <span className="text-lg font-semibold">Edit profile</span>
            <Button variant="link" onClick={onDone} disabled={isSaving}>
                {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                "Done"
                )}
            </Button>
        </header>
    );
}

    
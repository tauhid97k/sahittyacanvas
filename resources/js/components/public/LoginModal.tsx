import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(
            '/login',
            { email, password, remember },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.reload();
                    }
                },
                onError: (errors) => {
                    setProcessing(false);
                    setErrors(errors as { email?: string; password?: string });
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>লগইন করুন</DialogTitle>
                    <DialogDescription>
                        এই ফিচারটি ব্যবহার করতে আপনাকে লগইন করতে হবে।
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="modal-email">ইমেইল</Label>
                        <Input
                            id="modal-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="modal-password">পাসওয়ার্ড</Label>
                            <TextLink
                                href="/forgot-password"
                                className="ml-auto text-sm text-muted-foreground"
                            >
                                পাসওয়ার্ড ভুলে গেছেন?
                            </TextLink>
                        </div>
                        <Input
                            id="modal-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="পাসওয়ার্ড"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="modal-remember"
                            checked={remember}
                            onCheckedChange={(checked) => setRemember(checked === true)}
                        />
                        <Label htmlFor="modal-remember">মনে রাখুন</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={processing} isLoading={processing}>
                        লগইন
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        অ্যাকাউন্ট নেই?{' '}
                        <TextLink href="/register">
                            নিবন্ধন করুন
                        </TextLink>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

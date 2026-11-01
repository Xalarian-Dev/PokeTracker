import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../hooks/use-toast';
import {
    Button, Input, Textarea, Label,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from './ui';

interface FeedbackDialogProps {
    /** Élément qui ouvre la fenêtre (bouton ou lien) */
    children: React.ReactNode;
}

/** Formulaire « Signaler un problème / suggestion », ouvert depuis le pied de page. */
const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ children }) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const categories = [
        { value: 'missing_pokemon', label: t('feedback_missing_pokemon') },
        { value: 'bug', label: t('feedback_bug') },
        { value: 'question', label: t('feedback_question') },
        { value: 'suggestion', label: t('feedback_suggestion') },
        { value: 'other', label: t('feedback_other') },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSending(true);
        try {
            await emailjs.send(
                'service_kw9wlxv',
                'template_tm49upf',
                {
                    category: categories.find(c => c.value === category)?.label || category,
                    message,
                    user_email: email || 'Non fourni',
                    from_name: email || 'Utilisateur anonyme',
                },
                'zI8GA9OVh8oum4Iza'
            );
            toast({ title: t('feedback_success') });
            setMessage('');
            setEmail('');
            setCategory('bug');
            setOpen(false);
        } catch (error) {
            console.error('Error sending feedback:', error);
            toast({ title: t('feedback_error'), variant: 'destructive' });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle>{t('feedback')}</DialogTitle>
                    <DialogDescription className="text-gray-300">{t('feedback_description')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="feedback-category" className="text-gray-300">{t('feedback_category')}</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="feedback-category" className="w-full mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                                {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="text-white focus:bg-gray-600">
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="feedback-message" className="text-gray-300">{t('feedback_message')}</Label>
                        <Textarea
                            id="feedback-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('feedback_message_placeholder')}
                            rows={5}
                            required
                            className="mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow"
                        />
                    </div>

                    <div>
                        <Label htmlFor="feedback-email" className="text-gray-300">{t('feedback_email')} ({t('optional')})</Label>
                        <Input
                            id="feedback-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('feedback_email_placeholder')}
                            className="mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="w-full bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                    >
                        {sending ? t('sending') : t('send')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackDialog;

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../contexts/LanguageContext';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [category, setCategory] = useState('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const categories = [
        { value: 'missing_pokemon', label: t('feedback_missing_pokemon') },
        { value: 'bug', label: t('feedback_bug') },
        { value: 'question', label: t('feedback_question') },
        { value: 'suggestion', label: t('feedback_suggestion') },
        { value: 'other', label: t('feedback_other') },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        setSending(true);
        setStatus('idle');

        try {
            // EmailJS configuration
            const serviceId = 'service_kw9wlxv';
            const templateId = 'template_tm49upf';
            const publicKey = 'zI8GA9OVh8oum4Iza';

            await emailjs.send(
                serviceId,
                templateId,
                {
                    category: categories.find(c => c.value === category)?.label || category,
                    message: message,
                    user_email: email || 'Non fourni',
                    from_name: email || 'Utilisateur anonyme',
                },
                publicKey
            );

            setStatus('success');
            setMessage('');
            setEmail('');
            setCategory('bug');

            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Error sending feedback:', error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-4">{t('feedback_title')}</h2>
                <p className="text-gray-400 text-sm mb-6">{t('feedback_description')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('feedback_category')}
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('feedback_email')} <span className="text-gray-500">({t('optional')})</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('feedback_email_placeholder')}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('feedback_message')} <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('feedback_message_placeholder')}
                            rows={5}
                            required
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                        />
                    </div>

                    {status === 'success' && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                            {t('feedback_success')}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                            {t('feedback_error')}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? t('sending') : t('send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;

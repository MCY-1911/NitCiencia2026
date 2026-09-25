export interface AppEvent {
    type?: 'new_capture' | 'training_progress' | 'training_completed';
    progress?: number;
    status?: string;

    prediction?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    image?: string;
}
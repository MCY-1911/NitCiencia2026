export interface AppEvent {
    type: 'new_capture' | 'training_progress' | 'training_completed';
    progress?: number;
    status?: string;
}
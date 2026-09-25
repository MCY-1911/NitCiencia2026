export interface InferenceResult {
    prediction: string;
    confidence: number;
    probabilities: Record<string, number>;
    image: string
}
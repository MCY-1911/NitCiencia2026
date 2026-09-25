import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { InferenceResult } from '../../models/inferenceResult.model';

@Component({
  selector: 'app-inference-panel',
  imports: [DecimalPipe],
  templateUrl: './inference-panel.html',
  styleUrl: './inference-panel.css',
})
export class InferencePanel {
  @Input() liveImageUrl = '';
  @Input() inferenceImageUrl?: string;
  @Input() result?: InferenceResult;

  @Output() continueLive = new EventEmitter<void>();

  get displayedImageUrl(): string {
    return this.inferenceImageUrl ?? this.liveImageUrl;
  }

  get probabilities(): [string, number][] {
    if (!this.result) return [];
    return Object.entries(this.result.probabilities).sort((a, b) => b[1] - a[1]);
  }
}
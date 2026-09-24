import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-inference-dialog',
  imports: [DialogModule, ButtonModule],
  templateUrl: './inference-dialog.html',
  styleUrl: './inference-dialog.css',
})
export class InferenceDialog {
  
  @Input() visible = false;

  @Input() liveImageUrl?: string;
  @Output() visibleChange = new EventEmitter<boolean>();

  close() {
    this.visibleChange.emit(false);
  }
}
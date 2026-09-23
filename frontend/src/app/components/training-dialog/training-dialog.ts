import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TrainingState } from '../../models/training.model';

@Component({
  selector: 'app-training-dialog',
  imports: [ButtonModule, DialogModule, ProgressBarModule],
  templateUrl: './training-dialog.html',
  styleUrl: './training-dialog.css',
})
export class TrainingDialog {

  @Input()
  visible = false;

  @Input()
  state: TrainingState = 'ready';

  @Input()
  progress = 0;

  @Input()
  status = '';

  @Output()
  visibleChange = new EventEmitter<boolean>();

  @Output()
  startTraining = new EventEmitter<void>();

  close() {
    this.visibleChange.emit(false);
  }

  start() {
    this.startTraining.emit();
  }

}

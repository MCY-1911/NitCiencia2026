import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';


@Component({
  selector: 'app-training-dialog',
  imports: [ButtonModule, DialogModule, ProgressBarModule],
  templateUrl: './training-dialog.html',
  styleUrl: './training-dialog.css',
})
export class TrainingDialog {

  visible = signal(false);
  progress = signal(0);
  status = signal('Preparado para entrenar');

  open() {
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }

}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Capture } from '../../models/capture.model';
import { CaptureCarousel } from '../capture-carousel/capture-carousel';
import { ClassSelector } from '../class-selector/class-selector';

@Component({
  selector: 'app-capture-label-panel',
  imports: [CaptureCarousel, ClassSelector],
  templateUrl: './capture-label-panel.html',
  styleUrl: './capture-label-panel.css',
})
export class CaptureLabelPanel {
  @Input() captures: Capture[] = [];
  @Input() selectedCapture?: Capture;
  @Input() classes: string[] = [];

  @Output() captureSelected = new EventEmitter<Capture>();
  @Output() classSelected = new EventEmitter<string>();
  @Output() deleteSelected = new EventEmitter<void>();
}
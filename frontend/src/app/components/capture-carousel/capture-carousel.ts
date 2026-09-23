import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Capture } from '../../models/capture.model';

@Component({
  selector: 'app-capture-carousel',
  imports: [CarouselModule],
  templateUrl: './capture-carousel.html',
  styleUrl: './capture-carousel.css',
})
export class CaptureCarousel {

  @Input()
  captures: Capture[] = [];

  @Output()
  selected = new EventEmitter<Capture>();

  selectCapture(capture: Capture) {

    this.selected.emit(capture);

  }
}

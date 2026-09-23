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

  get numVisible(): number {
    return Math.min(this.captures.length, 4);
  }

  get showNavigators(): boolean {
    return this.captures.length > 4;
  }

  selectCapture(capture: Capture) {

    this.selected.emit(capture);

  }
}

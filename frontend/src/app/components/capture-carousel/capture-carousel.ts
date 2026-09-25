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

  @Input() captures: Capture[] = [];
  @Input() selectedCapture?: Capture;

  @Output() selected = new EventEmitter<Capture>();

  get numVisible(): number {
    return this.captures.length > 0 ? 1 : 0;
  }

  get showNavigators(): boolean {
    return this.captures.length > 1;
  }

  selectCapture(capture: Capture) {
    this.selected.emit(capture);
  }
}

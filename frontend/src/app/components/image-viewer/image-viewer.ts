import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-image-viewer',
  imports: [CardModule, TabsModule],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
})
export class ImageViewer {

  @Input() imageUrl?: string;
  @Input() liveImageUrl?: string; 
  @Output() tabChange = new EventEmitter<string>();

  onTabChange(value: string | number | undefined) {
    this.tabChange.emit(String(value));
  }

}

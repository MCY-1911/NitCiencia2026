import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-image-viewer',
  imports: [CardModule],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
})
export class ImageViewer {

  @Input()
  imageUrl?: string; 

}

import { Component, computed, inject, signal } from '@angular/core';

import { Api } from './services/api';
import { Capture } from './models/capture.model';
import { DatasetStats } from './models/dataset.model';
import { Header } from './components/header/header';
import { ImageViewer } from './components/image-viewer/image-viewer';
import { DatasetPanel } from './components/dataset-panel/dataset-panel';
import { CaptureCarousel } from './components/capture-carousel/capture-carousel';
import { ClassSelector } from './components/class-selector/class-selector';
import { Events } from './services/events';


@Component({
  selector: 'app-root',
  imports: [Header, ImageViewer, DatasetPanel, CaptureCarousel, ClassSelector],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private api = inject(Api);
  private events = inject(Events);

  captures = signal<Capture[]>([]);
  currentCapture = signal<Capture | undefined>(undefined);
  classes = signal<string[]>([]);
  datasetStats = signal<DatasetStats | undefined>(undefined);

  constructor() {
    this.loadData();
    this.events.connect(event => {
      console.log(
        'Evento recibido:',
        event
      );
      if (event === 'new_capture') {
        this.loadData();
      }
    });
  }

  loadData() {
    this.api.getPendingCaptures()
      .subscribe(captures => {

        const normalizedCaptures =
          this.normalizeCaptures(captures);

        this.captures.set(normalizedCaptures);

        this.currentCapture.set(
          normalizedCaptures.length > 0
            ? normalizedCaptures[0]
            : undefined
        );

      });

    this.api.getDatasetStats()
      .subscribe(stats => {
        this.datasetStats.set(stats);
      });

    this.api.getDatasetClasses()
      .subscribe(response => {
        this.classes.set(response.classes);
      });
  }

  currentImageUrl = computed(() => {

    const capture = this.currentCapture();

    return capture?.image_url;

  });

  onCaptureSelected(capture: Capture) {
    this.currentCapture.set(capture);
  }

  onClassSelected(label: string) {
    const capture = this.currentCapture();

    if (!capture)
      return;
    
    this.api.labelCapture(
      capture.capture_id,
      label
    ).subscribe(() => {
        console.log(
          'Captura etiquetada:',
          label
        );
        this.loadData();
      });
  }

  private normalizeCaptures(captures: Capture[]): Capture[] {

    return captures.map(capture => ({
      ...capture,
      image_url: this.api.getImageUrl(capture.image_url)
    }));

  }
}
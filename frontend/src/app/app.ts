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
import { TrainingDialog } from './components/training-dialog/training-dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [Header, ImageViewer, DatasetPanel, CaptureCarousel, ClassSelector, TrainingDialog, ButtonModule],
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

  trainingDialogVisible = signal(false);
  training = signal(false);
  trainingCompleted = signal(false);
  trainingProgress = signal(0);
  trainingStatus = signal('Preparando entrenamiento...');

  currentImageUrl = computed(() => {

    const capture = this.currentCapture();

    return capture?.image_url;

  });


  constructor() {
    this.loadData();
    this.events.connect(event => {
      console.log('Evento recibido:', event);

      if (event.type === 'new_capture') {
        this.loadData();
      }

      if (event.type === 'training_progress') {
        this.trainingProgress.set(event.progress ?? 0);
        this.trainingStatus.set(event.status ?? 'Entrenando...');
      }

      if (event.type === 'training_completed') {
        this.trainingProgress.set(100);
        this.trainingStatus.set(
          event.status ?? 'Entrenamiento completado'
        );

        this.training.set(false);
        this.trainingCompleted.set(true);
      }
    });
  }

  loadData() {
    this.api.getPendingCaptures()
      .subscribe(captures => {
        const normalizedCaptures = this.normalizeCaptures(captures);
        const currentCaptureId = this.currentCapture()?.capture_id;

        this.captures.set(normalizedCaptures);

        const currentCapture = normalizedCaptures.find(
          capture => capture.capture_id === currentCaptureId
        );

        this.currentCapture.set(
          currentCapture ?? normalizedCaptures[0]
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

  openTrainingDialog() {
    this.training.set(false);
    this.trainingCompleted.set(false);
    this.trainingProgress.set(0);
    this.trainingStatus.set('Preparado para entrenar');
    this.trainingDialogVisible.set(true);
  }

  onStartTraining() {
    this.training.set(true);
    this.trainingCompleted.set(false);
    this.trainingProgress.set(0);
    this.trainingStatus.set('Iniciando entrenamiento...');

    this.api.startTraining().subscribe({
      next: () => {
        this.trainingStatus.set('Entrenamiento iniciado...');
      },
      error: error => {
        console.error('Error al iniciar el entrenamiento:', error);

        this.training.set(false);
        this.trainingStatus.set('No se pudo iniciar el entrenamiento');
      }
    });
  }

  private normalizeCaptures(captures: Capture[]): Capture[] {
    return captures.map(capture => ({
      ...capture,
      image_url: this.api.getImageUrl(capture.image_url)
    }));

  }
}
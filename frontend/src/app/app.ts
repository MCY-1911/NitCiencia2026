import { Component, computed, inject, signal, OnDestroy } from '@angular/core';

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
import { TrainingState } from './models/training.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [Header, ImageViewer, DatasetPanel, CaptureCarousel, ClassSelector, TrainingDialog, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {

  private api = inject(Api);
  private events = inject(Events);

  private livePolling?: ReturnType<typeof setInterval>;
  private loadingLiveFrame = false;
  
  captures = signal<Capture[]>([]);
  currentCapture = signal<Capture | undefined>(undefined);
  liveImageUrl = signal<string | undefined>(undefined);

  classes = signal<string[]>([]);
  datasetStats = signal<DatasetStats | undefined>(undefined);

  trainingDialogVisible = signal(false);
  trainingState = signal<TrainingState>('ready');
  trainingProgress = signal(0);
  trainingStatus = signal('Preparando entrenamiento...');

  currentImageUrl = computed(() => {
    const capture = this.currentCapture();
    return capture?.image_url;
  });

  viewerTab = signal('captures');

  constructor() {
    this.loadData();
    this.events.connect(event => {

      if (event.type === 'new_capture') {
        this.loadData();
      }

      if (event.type === 'training_progress') {
        this.trainingState.set('training');
        this.trainingProgress.set(
          event.progress ?? 0
        );
        this.trainingStatus.set(
          event.status ?? 'Entrenando...'
        );
      }

      if (event.type === 'training_completed') {
        this.trainingState.set('completed');
        this.trainingProgress.set(100);
        this.trainingStatus.set(
          event.status ?? 'Entrenamiento completado'
        );
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

  onViewerTabChange(tab: string) {
    this.viewerTab.set(tab);
    if (tab === 'live') {
      this.startLivePolling();
    } else {
      this.stopLivePolling();
    }
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
    this.trainingState.set('ready');
    this.trainingProgress.set(0);
    this.trainingStatus.set('Preparado para entrenar');
    this.trainingDialogVisible.set(true);
  }

  onStartTraining() {
    this.trainingState.set('training');
    this.trainingProgress.set(0);
    this.trainingStatus.set('Iniciando entrenamiento...');

    this.api.startTraining().subscribe({
      error: error => {
        console.error('Error al iniciar el entrenamiento:', error);

        this.trainingState.set('error');
        this.trainingStatus.set('No se pudo iniciar el entrenamiento');
      }
    });
  }

  loadLiveFrame() {
    if (this.loadingLiveFrame) return;

    this.loadingLiveFrame = true;

    this.api.getLiveFrame().pipe(
      finalize(() => this.loadingLiveFrame = false)
    ).subscribe({
      next: response => {
        this.liveImageUrl.set(`data:image/jpeg;base64,${response.result.image}`);
      },
      error: error => {
        console.error('Error obteniendo imagen del MCU:', error);
      }
    });
  }

  startLivePolling() {
    if (this.livePolling) return;

    this.loadLiveFrame();

    this.livePolling = setInterval(() => {
      this.loadLiveFrame();
    }, 500);
  }

  stopLivePolling() {
    if (!this.livePolling) return;

    clearInterval(this.livePolling);
    this.livePolling = undefined;
  }

  private normalizeCaptures(captures: Capture[]): Capture[] {
    return captures.map(capture => ({
      ...capture,
      image_url: this.api.getImageUrl(capture.image_url)
    }));
  }

  ngOnDestroy() {
    this.stopLivePolling();
  }
}
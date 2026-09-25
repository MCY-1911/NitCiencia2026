import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Capture } from '../models/capture.model';
import { DatasetClasses, DatasetStats } from '../models/dataset.model';
import { McuResponse } from '../models/mcu.model';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8000';
  private apiUrl = `${this.backendUrl}/api`;
  private mcuUrl = 'http://192.168.53.209/jsonrpc';

  // ============================================================
  // CAPTURES
  // ============================================================

  getLatestCapture() {
    return this.http.get<Capture>(
      `${this.apiUrl}/captures/latest`
    );
  }

  getPendingCaptures() {
    return this.http.get<Capture[]>(
      `${this.apiUrl}/captures/pending`
    );
  }

  labelCapture(
    captureId: string,
    label: string
  ) {
    return this.http.post(
      `${this.apiUrl}/captures/${captureId}/label`,
      {
        label: label
      }
    );
  }

  getImageUrl(imageUrl: string): string {
    return `${this.backendUrl}${imageUrl}`;
  }

  deleteCapture(captureId: string) {
    return this.http.delete<void>(`${this.apiUrl}/captures/${captureId}`);
  }


  // ============================================================
  // DATASET
  // ============================================================

  getDatasetStats() {
    return this.http.get<DatasetStats>(
      `${this.apiUrl}/dataset/stats`
    );
  }


  getDatasetClasses() {
    return this.http.get<DatasetClasses>(
      `${this.apiUrl}/dataset/classes`
    );
  }

  // ============================================================
  // TRAINING
  // ============================================================

  startTraining() {
    return this.http.post<{ status: string }>(
      `${this.apiUrl}/model/startTrain`,
      {}
    );
  }

  // ============================================================
  // STREAMING
  // ============================================================

  getLiveFrame() {
    return this.http.post<McuResponse>(`${this.apiUrl}/mcu/image`, {});
  }


  // ============================================================
  // CHANGE MODE
  // ============================================================

  changeMode() {
    return this.http.post<McuResponse>(`${this.apiUrl}/mcu/changeMode`, {});
  }

  // ============================================================
  // INFERENCE
  // ============================================================

  // makeInference() {
  //   return this.http.post<{ status: string }>(
  //     `${this.apiUrl}/model/startTrain`,
  //     {}
  //   );
  // }
}

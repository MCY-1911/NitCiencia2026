import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Capture } from '../models/capture.model';
import { DatasetStats } from '../models/dataset.model';

export interface DatasetClasses {
  classes: string[];
}


@Injectable({
  providedIn: 'root',
})
export class Api {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';
  private backendUrl = 'http://127.0.0.1:8000';

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

  getImageUrl(imageUrl: string) {
    return `${this.backendUrl}${imageUrl}`;
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
}

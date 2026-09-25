import { Injectable } from '@angular/core';
import { AppEvent } from '../models/event.model';
import { InferenceResult } from '../models/inferenceResult.model';

@Injectable({
  providedIn: 'root',
})
export class Events {

  private url = 'http://localhost:8000/api/events/stream';

  connect(callback: (event: AppEvent | InferenceResult) => void) {
    const source = new EventSource(this.url);

    source.onmessage = message => {
      const event = JSON.parse(message.data) as AppEvent | InferenceResult;
      callback(event);
    };

    source.onerror = error => {
      console.error('Error SSE', error);
    };
  }
}

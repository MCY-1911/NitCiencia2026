import { Injectable } from '@angular/core';
import { AppEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class Events {
  private url = 'http://aiotserver.uji.es/coral/api/events/stream';

  connect(callback: (event: AppEvent) => void) {
    const source = new EventSource(this.url);

    source.onmessage = message => {
      const event = JSON.parse(message.data) as AppEvent;
      callback(event);
    };

    source.onerror = error => {
      console.error('Error SSE:', error);
    };
  }
}
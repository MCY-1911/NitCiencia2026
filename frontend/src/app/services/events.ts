import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Events {

  private url = 'http://localhost:8000/api/events/stream';

  connect(callback: (event: string) => void) {
    const source = new EventSource(this.url);
    source.onmessage = message => {
      callback(message.data);
    };

    source.onerror = error => {
      console.error(
        'Error SSE',
        error
      );
    };
  }
}

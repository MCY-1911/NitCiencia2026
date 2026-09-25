import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DatasetStats } from '../../models/dataset.model';

@Component({
  selector: 'app-dataset-panel',
  imports: [CardModule],
  templateUrl: './dataset-panel.html',
  styleUrl: './dataset-panel.css',
})
export class DatasetPanel {
  @Input() stats?: DatasetStats;
  @Input() classes: string[] = [];

  getIcon(label: string): string {
    const icons: Record<string, string> = {
      manzana: '🍎',
      poma: '🍎',
      pera: '🍐',
      plátano: '🍌',
      platano: '🍌',
      plàtan: '🍌',
      naranja: '🍊',
      taronja: '🍊'
    };

    return icons[label.toLowerCase()] ?? '📦';
  }
}
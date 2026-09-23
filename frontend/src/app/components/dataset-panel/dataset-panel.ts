import { Component, Input } from '@angular/core';
import { CardModule} from 'primeng/card';
import { ProgressBarModule} from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DatasetStats } from '../../models/dataset.model';

@Component({
  selector: 'app-dataset-panel',
  imports: [CardModule, ProgressBarModule, TagModule],
  templateUrl: './dataset-panel.html',
  styleUrl: './dataset-panel.css',
})
export class DatasetPanel {

  @Input()
  stats?: DatasetStats;

  @Input()
  classes: string[] = [];


  percentage(label: string): number {
    if (!this.stats || this.stats.total === 0)
      return 0;
    const value = this.stats.classes[label] ?? 0;
    return ( value / this.stats.total) * 100;
  }
}

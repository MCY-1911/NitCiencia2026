import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-class-selector',
  imports: [ButtonModule],
  templateUrl: './class-selector.html',
  styleUrl: './class-selector.css',
})
export class ClassSelector {

  @Input() classes: string[] = [];
  @Input() disabled = false;

  @Output() selected = new EventEmitter<string>();
  @Output() deleteSelected = new EventEmitter<void>();

  
  selectClass(label: string) {
    this.selected.emit(label);
  }

  deleteCapture() {
    this.deleteSelected.emit();
  }
}

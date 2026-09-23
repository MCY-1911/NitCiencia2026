import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetPanel } from './dataset-panel';

describe('DatasetPanel', () => {
  let component: DatasetPanel;
  let fixture: ComponentFixture<DatasetPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

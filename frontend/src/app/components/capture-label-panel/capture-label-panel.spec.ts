import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureLabelPanel } from './capture-label-panel';

describe('CaptureLabelPanel', () => {
  let component: CaptureLabelPanel;
  let fixture: ComponentFixture<CaptureLabelPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptureLabelPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureLabelPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InferencePanel } from './inference-panel';

describe('InferencePanel', () => {
  let component: InferencePanel;
  let fixture: ComponentFixture<InferencePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InferencePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(InferencePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

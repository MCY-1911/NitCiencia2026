import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InferenceDialog } from './inference-dialog';

describe('InferenceDialog', () => {
  let component: InferenceDialog;
  let fixture: ComponentFixture<InferenceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InferenceDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(InferenceDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

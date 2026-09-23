import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingDialog } from './training-dialog';

describe('TrainingDialog', () => {
  let component: TrainingDialog;
  let fixture: ComponentFixture<TrainingDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

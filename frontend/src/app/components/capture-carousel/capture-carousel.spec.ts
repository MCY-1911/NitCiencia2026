import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureCarousel } from './capture-carousel';

describe('CaptureCarousel', () => {
  let component: CaptureCarousel;
  let fixture: ComponentFixture<CaptureCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptureCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

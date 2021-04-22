import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirAssessmentComponent } from './compressed-air-assessment.component';

describe('CompressedAirAssessmentComponent', () => {
  let component: CompressedAirAssessmentComponent;
  let fixture: ComponentFixture<CompressedAirAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

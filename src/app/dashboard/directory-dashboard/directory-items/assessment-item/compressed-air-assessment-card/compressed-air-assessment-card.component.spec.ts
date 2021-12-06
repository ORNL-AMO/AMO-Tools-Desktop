import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirAssessmentCardComponent } from './compressed-air-assessment-card.component';

describe('CompressedAirAssessmentCardComponent', () => {
  let component: CompressedAirAssessmentCardComponent;
  let fixture: ComponentFixture<CompressedAirAssessmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirAssessmentCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirAssessmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

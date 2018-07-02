import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityInfoSummaryComponent } from './facility-info-summary.component';

describe('FacilityInfoSummaryComponent', () => {
  let component: FacilityInfoSummaryComponent;
  let fixture: ComponentFixture<FacilityInfoSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilityInfoSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityInfoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

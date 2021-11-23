import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReportComponent } from './compressed-air-report.component';

describe('CompressedAirReportComponent', () => {
  let component: CompressedAirReportComponent;
  let fixture: ComponentFixture<CompressedAirReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

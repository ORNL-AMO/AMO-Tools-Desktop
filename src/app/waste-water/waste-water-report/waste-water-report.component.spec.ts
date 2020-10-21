import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterReportComponent } from './waste-water-report.component';

describe('WasteWaterReportComponent', () => {
  let component: WasteWaterReportComponent;
  let fixture: ComponentFixture<WasteWaterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

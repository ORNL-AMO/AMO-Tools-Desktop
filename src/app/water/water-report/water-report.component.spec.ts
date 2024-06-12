import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterReportComponent } from './water-report.component';

describe('WaterReportComponent', () => {
  let component: WaterReportComponent;
  let fixture: ComponentFixture<WaterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

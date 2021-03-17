import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterSummaryComponent } from './waste-water-summary.component';

describe('WasteWaterSummaryComponent', () => {
  let component: WasteWaterSummaryComponent;
  let fixture: ComponentFixture<WasteWaterSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

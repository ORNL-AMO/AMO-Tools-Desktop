import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterAnalysisComponent } from './waste-water-analysis.component';

describe('WasteWaterAnalysisComponent', () => {
  let component: WasteWaterAnalysisComponent;
  let fixture: ComponentFixture<WasteWaterAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

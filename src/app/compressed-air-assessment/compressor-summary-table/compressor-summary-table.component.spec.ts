import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorSummaryTableComponent } from './compressor-summary-table.component';

describe('CompressorSummaryTableComponent', () => {
  let component: CompressorSummaryTableComponent;
  let fixture: ComponentFixture<CompressorSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorSummaryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

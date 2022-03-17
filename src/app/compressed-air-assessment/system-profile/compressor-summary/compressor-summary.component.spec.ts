import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorSummaryComponent } from './compressor-summary.component';

describe('CompressorSummaryComponent', () => {
  let component: CompressorSummaryComponent;
  let fixture: ComponentFixture<CompressorSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

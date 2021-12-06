import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorItemSummaryComponent } from './compressor-item-summary.component';

describe('CompressorItemSummaryComponent', () => {
  let component: CompressorItemSummaryComponent;
  let fixture: ComponentFixture<CompressorItemSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressorItemSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorItemSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

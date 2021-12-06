import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirRollupPrintComponent } from './compressed-air-rollup-print.component';

describe('CompressedAirRollupPrintComponent', () => {
  let component: CompressedAirRollupPrintComponent;
  let fixture: ComponentFixture<CompressedAirRollupPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirRollupPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

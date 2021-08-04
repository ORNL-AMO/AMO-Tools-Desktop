import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterRollupPrintComponent } from './waste-water-rollup-print.component';

describe('WasteWaterRollupPrintComponent', () => {
  let component: WasteWaterRollupPrintComponent;
  let fixture: ComponentFixture<WasteWaterRollupPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterRollupPrintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

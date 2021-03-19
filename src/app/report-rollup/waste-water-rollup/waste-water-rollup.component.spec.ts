import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterRollupComponent } from './waste-water-rollup.component';

describe('WasteWaterRollupComponent', () => {
  let component: WasteWaterRollupComponent;
  let fixture: ComponentFixture<WasteWaterRollupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterRollupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterCalculationsTableComponent } from './waste-water-calculations-table.component';

describe('WasteWaterCalculationsTableComponent', () => {
  let component: WasteWaterCalculationsTableComponent;
  let fixture: ComponentFixture<WasteWaterCalculationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterCalculationsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterCalculationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

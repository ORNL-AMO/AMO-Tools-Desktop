import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterOperationsComponent } from './waste-water-operations.component';

describe('WasteWaterOperationsComponent', () => {
  let component: WasteWaterOperationsComponent;
  let fixture: ComponentFixture<WasteWaterOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterComponent } from './waste-water.component';

describe('WasteWaterComponent', () => {
  let component: WasteWaterComponent;
  let fixture: ComponentFixture<WasteWaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

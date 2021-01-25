import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterListComponent } from './waste-water-list.component';

describe('WasteWaterListComponent', () => {
  let component: WasteWaterListComponent;
  let fixture: ComponentFixture<WasteWaterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

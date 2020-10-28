import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterGraphsComponent } from './waste-water-graphs.component';

describe('WasteWaterGraphsComponent', () => {
  let component: WasteWaterGraphsComponent;
  let fixture: ComponentFixture<WasteWaterGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterDiagramComponent } from './waste-water-diagram.component';

describe('WasteWaterDiagramComponent', () => {
  let component: WasteWaterDiagramComponent;
  let fixture: ComponentFixture<WasteWaterDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

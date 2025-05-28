import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterProcessDiagramComponent } from './water-process-diagram.component';

describe('WaterProcessDiagramComponent', () => {
  let component: WaterProcessDiagramComponent;
  let fixture: ComponentFixture<WaterProcessDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaterProcessDiagramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterProcessDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

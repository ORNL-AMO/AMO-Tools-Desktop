import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDiagramComponent } from './water-diagram.component';

describe('WaterDiagramComponent', () => {
  let component: WaterDiagramComponent;
  let fixture: ComponentFixture<WaterDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDiagramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

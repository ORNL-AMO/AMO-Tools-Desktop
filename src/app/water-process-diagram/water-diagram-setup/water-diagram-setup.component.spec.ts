import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDiagramSetupComponent } from './water-diagram-setup.component';

describe('WaterDiagramSetupComponent', () => {
  let component: WaterDiagramSetupComponent;
  let fixture: ComponentFixture<WaterDiagramSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDiagramSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterDiagramSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

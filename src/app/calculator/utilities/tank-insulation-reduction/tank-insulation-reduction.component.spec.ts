import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankInsulationReductionComponent } from './tank-insulation-reduction.component';

describe('TankInsulationReductionComponent', () => {
  let component: TankInsulationReductionComponent;
  let fixture: ComponentFixture<TankInsulationReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankInsulationReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankInsulationReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

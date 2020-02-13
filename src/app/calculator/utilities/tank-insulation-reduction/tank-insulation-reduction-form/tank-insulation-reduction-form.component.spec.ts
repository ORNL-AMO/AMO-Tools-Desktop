import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankInsulationReductionFormComponent } from './tank-insulation-reduction-form.component';

describe('TankInsulationReductionFormComponent', () => {
  let component: TankInsulationReductionFormComponent;
  let fixture: ComponentFixture<TankInsulationReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankInsulationReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankInsulationReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

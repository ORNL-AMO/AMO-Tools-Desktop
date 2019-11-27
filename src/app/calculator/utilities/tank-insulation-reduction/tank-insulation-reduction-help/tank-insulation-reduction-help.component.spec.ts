import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankInsulationReductionHelpComponent } from './tank-insulation-reduction-help.component';

describe('TankInsulationReductionHelpComponent', () => {
  let component: TankInsulationReductionHelpComponent;
  let fixture: ComponentFixture<TankInsulationReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankInsulationReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankInsulationReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

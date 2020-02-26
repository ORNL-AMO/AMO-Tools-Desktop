import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankInsulationReductionResultsComponent } from './tank-insulation-reduction-results.component';

describe('TankInsulationReductionResultsComponent', () => {
  let component: TankInsulationReductionResultsComponent;
  let fixture: ComponentFixture<TankInsulationReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankInsulationReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankInsulationReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

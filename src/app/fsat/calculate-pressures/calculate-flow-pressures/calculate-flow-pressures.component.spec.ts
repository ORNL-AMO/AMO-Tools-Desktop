import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateFlowPressuresComponent } from './calculate-flow-pressures.component';

describe('CalculateFlowPressuresComponent', () => {
  let component: CalculateFlowPressuresComponent;
  let fixture: ComponentFixture<CalculateFlowPressuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateFlowPressuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateFlowPressuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

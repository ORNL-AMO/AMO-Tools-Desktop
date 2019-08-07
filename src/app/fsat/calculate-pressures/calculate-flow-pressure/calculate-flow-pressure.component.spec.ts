import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateFlowPressureComponent } from './calculate-flow-pressure.component';

describe('CalculateFlowPressureComponent', () => {
  let component: CalculateFlowPressureComponent;
  let fixture: ComponentFixture<CalculateFlowPressureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateFlowPressureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateFlowPressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

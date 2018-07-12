import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanCurveDataComponent } from './fan-curve-data.component';

describe('FanCurveDataComponent', () => {
  let component: FanCurveDataComponent;
  let fixture: ComponentFixture<FanCurveDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanCurveDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanCurveDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

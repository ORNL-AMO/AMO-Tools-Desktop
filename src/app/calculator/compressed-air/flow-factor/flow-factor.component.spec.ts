import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowFactorComponent } from './flow-factor.component';

describe('FlowFactorComponent', () => {
  let component: FlowFactorComponent;
  let fixture: ComponentFixture<FlowFactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowFactorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

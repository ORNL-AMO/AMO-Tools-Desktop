import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowPressuresFormComponent } from './flow-pressures-form.component';

describe('FlowPressuresFormComponent', () => {
  let component: FlowPressuresFormComponent;
  let fixture: ComponentFixture<FlowPressuresFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowPressuresFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowPressuresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

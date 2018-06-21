import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowPressuresHelpComponent } from './flow-pressures-help.component';

describe('FlowPressuresHelpComponent', () => {
  let component: FlowPressuresHelpComponent;
  let fixture: ComponentFixture<FlowPressuresHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowPressuresHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowPressuresHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

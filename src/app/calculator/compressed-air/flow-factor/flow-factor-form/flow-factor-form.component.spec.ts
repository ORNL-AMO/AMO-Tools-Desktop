import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowFactorFormComponent } from './flow-factor-form.component';

describe('FlowFactorFormComponent', () => {
  let component: FlowFactorFormComponent;
  let fixture: ComponentFixture<FlowFactorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowFactorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowFactorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

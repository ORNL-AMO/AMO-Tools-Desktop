import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureTurbineFormComponent } from './pressure-turbine-form.component';

describe('PressureTurbineFormComponent', () => {
  let component: PressureTurbineFormComponent;
  let fixture: ComponentFixture<PressureTurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PressureTurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PressureTurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

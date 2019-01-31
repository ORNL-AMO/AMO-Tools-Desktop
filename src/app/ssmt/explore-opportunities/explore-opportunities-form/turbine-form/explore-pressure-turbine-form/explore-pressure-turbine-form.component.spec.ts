import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePressureTurbineFormComponent } from './explore-pressure-turbine-form.component';

describe('ExplorePressureTurbineFormComponent', () => {
  let component: ExplorePressureTurbineFormComponent;
  let fixture: ComponentFixture<ExplorePressureTurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorePressureTurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePressureTurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

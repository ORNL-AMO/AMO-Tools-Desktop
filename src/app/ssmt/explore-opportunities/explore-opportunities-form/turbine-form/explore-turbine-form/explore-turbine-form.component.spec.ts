import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreTurbineFormComponent } from './explore-turbine-form.component';

describe('ExploreTurbineFormComponent', () => {
  let component: ExploreTurbineFormComponent;
  let fixture: ComponentFixture<ExploreTurbineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreTurbineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreTurbineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

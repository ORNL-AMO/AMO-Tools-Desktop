import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByEquationFormComponent } from './by-equation-form.component';

describe('ByEquationFormComponent', () => {
  let component: ByEquationFormComponent;
  let fixture: ComponentFixture<ByEquationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByEquationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByEquationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

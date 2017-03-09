import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableOpeningFormComponent } from './variable-opening-form.component';

describe('VariableOpeningFormComponent', () => {
  let component: VariableOpeningFormComponent;
  let fixture: ComponentFixture<VariableOpeningFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableOpeningFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableOpeningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

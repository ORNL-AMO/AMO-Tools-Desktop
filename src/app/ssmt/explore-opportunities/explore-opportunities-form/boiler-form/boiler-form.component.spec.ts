import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerFormComponent } from './boiler-form.component';

describe('BoilerFormComponent', () => {
  let component: BoilerFormComponent;
  let fixture: ComponentFixture<BoilerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

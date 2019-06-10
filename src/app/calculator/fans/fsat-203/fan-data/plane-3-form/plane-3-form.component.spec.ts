import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Plane3FormComponent } from './plane-3-form.component';

describe('Plane3FormComponent', () => {
  let component: Plane3FormComponent;
  let fixture: ComponentFixture<Plane3FormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Plane3FormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Plane3FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

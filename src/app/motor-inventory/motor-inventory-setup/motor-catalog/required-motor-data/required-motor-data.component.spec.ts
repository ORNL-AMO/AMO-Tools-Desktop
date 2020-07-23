import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredMotorDataComponent } from './required-motor-data.component';

describe('RequiredMotorDataComponent', () => {
  let component: RequiredMotorDataComponent;
  let fixture: ComponentFixture<RequiredMotorDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequiredMotorDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequiredMotorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

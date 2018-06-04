import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatedMotorFormComponent } from './rated-motor-form.component';

describe('RatedMotorFormComponent', () => {
  let component: RatedMotorFormComponent;
  let fixture: ComponentFixture<RatedMotorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatedMotorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatedMotorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

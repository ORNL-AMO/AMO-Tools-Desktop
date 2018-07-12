import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingPointsFormComponent } from './operating-points-form.component';

describe('OperatingPointsFormComponent', () => {
  let component: OperatingPointsFormComponent;
  let fixture: ComponentFixture<OperatingPointsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingPointsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingPointsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

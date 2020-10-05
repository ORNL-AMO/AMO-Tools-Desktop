import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorOptionsTableComponent } from './motor-options-table.component';

describe('MotorOptionsTableComponent', () => {
  let component: MotorOptionsTableComponent;
  let fixture: ComponentFixture<MotorOptionsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorOptionsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorOptionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

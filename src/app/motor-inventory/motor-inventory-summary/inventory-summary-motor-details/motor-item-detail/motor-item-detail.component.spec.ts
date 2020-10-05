import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorItemDetailComponent } from './motor-item-detail.component';

describe('MotorItemDetailComponent', () => {
  let component: MotorItemDetailComponent;
  let fixture: ComponentFixture<MotorItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

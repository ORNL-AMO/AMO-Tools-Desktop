import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMotorModalComponent } from './select-motor-modal.component';

describe('SelectMotorModalComponent', () => {
  let component: SelectMotorModalComponent;
  let fixture: ComponentFixture<SelectMotorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMotorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMotorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

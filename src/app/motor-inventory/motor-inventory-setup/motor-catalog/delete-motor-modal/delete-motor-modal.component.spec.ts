import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMotorModalComponent } from './delete-motor-modal.component';

describe('DeleteMotorModalComponent', () => {
  let component: DeleteMotorModalComponent;
  let fixture: ComponentFixture<DeleteMotorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteMotorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteMotorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCapacityModalComponent } from './system-capacity-modal.component';

describe('SystemCapacityModalComponent', () => {
  let component: SystemCapacityModalComponent;
  let fixture: ComponentFixture<SystemCapacityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemCapacityModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCapacityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

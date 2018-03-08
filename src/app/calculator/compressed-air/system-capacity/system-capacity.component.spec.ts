import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCapacityComponent } from './system-capacity.component';

describe('SystemCapacityComponent', () => {
  let component: SystemCapacityComponent;
  let fixture: ComponentFixture<SystemCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCapacityFormComponent } from './system-capacity-form.component';

describe('SystemCapacityFormComponent', () => {
  let component: SystemCapacityFormComponent;
  let fixture: ComponentFixture<SystemCapacityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCapacityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCapacityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

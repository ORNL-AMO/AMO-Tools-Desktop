import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorqueDataComponent } from './torque-data.component';

describe('TorqueDataComponent', () => {
  let component: TorqueDataComponent;
  let fixture: ComponentFixture<TorqueDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorqueDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorqueDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

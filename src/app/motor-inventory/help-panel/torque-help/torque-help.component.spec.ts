import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorqueHelpComponent } from './torque-help.component';

describe('TorqueHelpComponent', () => {
  let component: TorqueHelpComponent;
  let fixture: ComponentFixture<TorqueHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorqueHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorqueHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

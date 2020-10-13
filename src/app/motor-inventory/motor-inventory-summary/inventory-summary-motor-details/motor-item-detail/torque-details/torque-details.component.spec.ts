import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorqueDetailsComponent } from './torque-details.component';

describe('TorqueDetailsComponent', () => {
  let component: TorqueDetailsComponent;
  let fixture: ComponentFixture<TorqueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorqueDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorqueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorquePropertiesComponent } from './torque-properties.component';

describe('TorquePropertiesComponent', () => {
  let component: TorquePropertiesComponent;
  let fixture: ComponentFixture<TorquePropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorquePropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorquePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

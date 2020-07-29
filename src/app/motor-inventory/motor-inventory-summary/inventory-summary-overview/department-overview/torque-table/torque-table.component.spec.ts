import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorqueTableComponent } from './torque-table.component';

describe('TorqueTableComponent', () => {
  let component: TorqueTableComponent;
  let fixture: ComponentFixture<TorqueTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorqueTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorqueTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

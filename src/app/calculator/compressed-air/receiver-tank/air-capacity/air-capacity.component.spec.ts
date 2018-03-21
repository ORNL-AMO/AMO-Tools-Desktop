import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirCapacityComponent } from './air-capacity.component';

describe('AirCapacityComponent', () => {
  let component: AirCapacityComponent;
  let fixture: ComponentFixture<AirCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

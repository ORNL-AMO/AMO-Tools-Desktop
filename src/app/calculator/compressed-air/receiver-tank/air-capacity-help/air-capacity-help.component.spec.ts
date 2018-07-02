import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirCapacityHelpComponent } from './air-capacity-help.component';

describe('AirCapacityHelpComponent', () => {
  let component: AirCapacityHelpComponent;
  let fixture: ComponentFixture<AirCapacityHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirCapacityHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirCapacityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

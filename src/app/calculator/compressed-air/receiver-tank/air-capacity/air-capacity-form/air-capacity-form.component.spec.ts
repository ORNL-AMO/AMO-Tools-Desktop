import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirCapacityFormComponent } from './air-capacity-form.component';

describe('AirCapacityFormComponent', () => {
  let component: AirCapacityFormComponent;
  let fixture: ComponentFixture<AirCapacityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirCapacityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirCapacityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

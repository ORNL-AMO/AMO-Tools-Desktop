import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatedOperatingPointsFormComponent } from './rated-operating-points-form.component';

describe('RatedOperatingPointsFormComponent', () => {
  let component: RatedOperatingPointsFormComponent;
  let fixture: ComponentFixture<RatedOperatingPointsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatedOperatingPointsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatedOperatingPointsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

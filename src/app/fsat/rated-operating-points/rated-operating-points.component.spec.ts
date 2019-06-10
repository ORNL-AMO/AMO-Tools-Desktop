import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatedOperatingPointsComponent } from './rated-operating-points.component';

describe('RatedOperatingPointsComponent', () => {
  let component: RatedOperatingPointsComponent;
  let fixture: ComponentFixture<RatedOperatingPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatedOperatingPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatedOperatingPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingPointsComponent } from './operating-points.component';

describe('OperatingPointsComponent', () => {
  let component: OperatingPointsComponent;
  let fixture: ComponentFixture<OperatingPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

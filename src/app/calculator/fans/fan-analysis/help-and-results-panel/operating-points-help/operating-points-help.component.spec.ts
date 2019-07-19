import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingPointsHelpComponent } from './operating-points-help.component';

describe('OperatingPointsHelpComponent', () => {
  let component: OperatingPointsHelpComponent;
  let fixture: ComponentFixture<OperatingPointsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingPointsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingPointsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

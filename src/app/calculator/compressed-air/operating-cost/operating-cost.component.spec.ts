import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingCostComponent } from './operating-cost.component';

describe('OperatingCostComponent', () => {
  let component: OperatingCostComponent;
  let fixture: ComponentFixture<OperatingCostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingCostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

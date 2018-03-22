import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingCostHelpComponent } from './operating-cost-help.component';

describe('OperatingCostHelpComponent', () => {
  let component: OperatingCostHelpComponent;
  let fixture: ComponentFixture<OperatingCostHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingCostHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingCostHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

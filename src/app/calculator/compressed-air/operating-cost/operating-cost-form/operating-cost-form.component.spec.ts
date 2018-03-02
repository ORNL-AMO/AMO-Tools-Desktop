import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingCostFormComponent } from './operating-cost-form.component';

describe('OperatingCostFormComponent', () => {
  let component: OperatingCostFormComponent;
  let fixture: ComponentFixture<OperatingCostFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingCostFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingCostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

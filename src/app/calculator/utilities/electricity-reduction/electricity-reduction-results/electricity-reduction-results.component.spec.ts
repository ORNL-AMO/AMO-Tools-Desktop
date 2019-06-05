import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityReductionResultsComponent } from './electricity-reduction-results.component';

describe('ElectricityReductionResultsComponent', () => {
  let component: ElectricityReductionResultsComponent;
  let fixture: ComponentFixture<ElectricityReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricityReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricityReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

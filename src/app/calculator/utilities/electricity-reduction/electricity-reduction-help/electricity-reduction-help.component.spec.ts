import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityReductionHelpComponent } from './electricity-reduction-help.component';

describe('ElectricityReductionHelpComponent', () => {
  let component: ElectricityReductionHelpComponent;
  let fixture: ComponentFixture<ElectricityReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricityReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricityReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

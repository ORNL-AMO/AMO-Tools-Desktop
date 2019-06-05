import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityReductionFormComponent } from './electricity-reduction-form.component';

describe('ElectricityReductionFormComponent', () => {
  let component: ElectricityReductionFormComponent;
  let fixture: ComponentFixture<ElectricityReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricityReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricityReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

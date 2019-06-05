import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityReductionComponent } from './electricity-reduction.component';

describe('ElectricityReductionComponent', () => {
  let component: ElectricityReductionComponent;
  let fixture: ComponentFixture<ElectricityReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricityReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricityReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

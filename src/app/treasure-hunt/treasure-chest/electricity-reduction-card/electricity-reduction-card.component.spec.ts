import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricityReductionCardComponent } from './electricity-reduction-card.component';

describe('ElectricityReductionCardComponent', () => {
  let component: ElectricityReductionCardComponent;
  let fixture: ComponentFixture<ElectricityReductionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricityReductionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricityReductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

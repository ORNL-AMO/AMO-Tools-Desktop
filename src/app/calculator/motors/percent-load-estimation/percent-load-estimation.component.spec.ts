import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentLoadEstimationComponent } from './percent-load-estimation.component';

describe('PercentLoadEstimationComponent', () => {
  let component: PercentLoadEstimationComponent;
  let fixture: ComponentFixture<PercentLoadEstimationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentLoadEstimationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentLoadEstimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

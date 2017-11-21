import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentLoadEstimationFormComponent } from './percent-load-estimation-form.component';

describe('PercentLoadEstimationFormComponent', () => {
  let component: PercentLoadEstimationFormComponent;
  let fixture: ComponentFixture<PercentLoadEstimationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentLoadEstimationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentLoadEstimationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

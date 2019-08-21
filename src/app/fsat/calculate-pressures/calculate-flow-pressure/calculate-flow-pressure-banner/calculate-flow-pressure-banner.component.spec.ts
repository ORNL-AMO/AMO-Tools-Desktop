import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateFlowPressureBannerComponent } from './calculate-flow-pressure-banner.component';

describe('CalculateFlowPressureBannerComponent', () => {
  let component: CalculateFlowPressureBannerComponent;
  let fixture: ComponentFixture<CalculateFlowPressureBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateFlowPressureBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateFlowPressureBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

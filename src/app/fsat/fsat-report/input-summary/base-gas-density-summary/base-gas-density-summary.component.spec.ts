import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseGasDensitySummaryComponent } from './base-gas-density-summary.component';

describe('BaseGasDensitySummaryComponent', () => {
  let component: BaseGasDensitySummaryComponent;
  let fixture: ComponentFixture<BaseGasDensitySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseGasDensitySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseGasDensitySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

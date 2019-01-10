import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergySummaryComponent } from './energy-summary.component';

describe('EnergySummaryComponent', () => {
  let component: EnergySummaryComponent;
  let fixture: ComponentFixture<EnergySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

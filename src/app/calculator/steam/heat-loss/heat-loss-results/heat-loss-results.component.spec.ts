import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatLossResultsComponent } from './heat-loss-results.component';

describe('HeatLossResultsComponent', () => {
  let component: HeatLossResultsComponent;
  let fixture: ComponentFixture<HeatLossResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatLossResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatLossResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

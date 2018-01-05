import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasSummaryComponent } from './flue-gas-summary.component';

describe('FlueGasSummaryComponent', () => {
  let component: FlueGasSummaryComponent;
  let fixture: ComponentFixture<FlueGasSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

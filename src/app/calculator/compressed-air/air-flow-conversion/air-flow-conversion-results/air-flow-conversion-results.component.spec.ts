import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFlowConversionResultsComponent } from './air-flow-conversion-results.component';

describe('AirFlowConversionResultsComponent', () => {
  let component: AirFlowConversionResultsComponent;
  let fixture: ComponentFixture<AirFlowConversionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFlowConversionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFlowConversionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

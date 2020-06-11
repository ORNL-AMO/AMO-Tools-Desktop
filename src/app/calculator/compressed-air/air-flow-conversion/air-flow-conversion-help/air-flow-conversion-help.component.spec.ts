import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFlowConversionHelpComponent } from './air-flow-conversion-help.component';

describe('AirFlowConversionHelpComponent', () => {
  let component: AirFlowConversionHelpComponent;
  let fixture: ComponentFixture<AirFlowConversionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFlowConversionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFlowConversionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

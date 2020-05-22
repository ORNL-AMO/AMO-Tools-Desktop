import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFlowConversionComponent } from './air-flow-conversion.component';

describe('AirFlowConversionComponent', () => {
  let component: AirFlowConversionComponent;
  let fixture: ComponentFixture<AirFlowConversionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFlowConversionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFlowConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

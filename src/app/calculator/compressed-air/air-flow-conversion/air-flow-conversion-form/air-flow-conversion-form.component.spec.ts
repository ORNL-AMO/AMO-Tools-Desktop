import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFlowConversionFormComponent } from './air-flow-conversion-form.component';

describe('AirFlowConversionFormComponent', () => {
  let component: AirFlowConversionFormComponent;
  let fixture: ComponentFixture<AirFlowConversionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFlowConversionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFlowConversionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatLossHelpComponent } from './heat-loss-help.component';

describe('HeatLossHelpComponent', () => {
  let component: HeatLossHelpComponent;
  let fixture: ComponentFixture<HeatLossHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatLossHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatLossHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatLossComponent } from './heat-loss.component';

describe('HeatLossComponent', () => {
  let component: HeatLossComponent;
  let fixture: ComponentFixture<HeatLossComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatLossComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

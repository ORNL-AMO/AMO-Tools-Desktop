import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatLossTableComponent } from './heat-loss-table.component';

describe('HeatLossTableComponent', () => {
  let component: HeatLossTableComponent;
  let fixture: ComponentFixture<HeatLossTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatLossTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatLossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

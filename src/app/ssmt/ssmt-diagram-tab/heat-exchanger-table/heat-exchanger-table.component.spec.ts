import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatExchangerTableComponent } from './heat-exchanger-table.component';

describe('HeatExchangerTableComponent', () => {
  let component: HeatExchangerTableComponent;
  let fixture: ComponentFixture<HeatExchangerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatExchangerTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatExchangerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

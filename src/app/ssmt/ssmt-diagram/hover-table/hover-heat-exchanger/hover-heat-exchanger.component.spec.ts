import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverHeatExchangerComponent } from './hover-heat-exchanger.component';

describe('HoverHeatExchangerComponent', () => {
  let component: HoverHeatExchangerComponent;
  let fixture: ComponentFixture<HoverHeatExchangerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverHeatExchangerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverHeatExchangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

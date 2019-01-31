import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverMakeupWaterComponent } from './hover-makeup-water.component';

describe('HoverMakeupWaterComponent', () => {
  let component: HoverMakeupWaterComponent;
  let fixture: ComponentFixture<HoverMakeupWaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverMakeupWaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverMakeupWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesTabsTooltipComponent } from './losses-tabs-tooltip.component';

describe('LossesTabsTooltipComponent', () => {
  let component: LossesTabsTooltipComponent;
  let fixture: ComponentFixture<LossesTabsTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesTabsTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesTabsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastTabsTooltipComponent } from './phast-tabs-tooltip.component';

describe('PhastTabsTooltipComponent', () => {
  let component: PhastTabsTooltipComponent;
  let fixture: ComponentFixture<PhastTabsTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastTabsTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastTabsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

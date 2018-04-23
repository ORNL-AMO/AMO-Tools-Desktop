import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatTabsTooltipComponent } from './psat-tabs-tooltip.component';

describe('PsatTabsTooltipComponent', () => {
  let component: PsatTabsTooltipComponent;
  let fixture: ComponentFixture<PsatTabsTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatTabsTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatTabsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

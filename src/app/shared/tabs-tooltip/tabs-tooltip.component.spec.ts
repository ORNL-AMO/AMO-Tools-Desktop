import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsTooltipComponent } from './tabs-tooltip.component';

describe('TabsTooltipComponent', () => {
  let component: TabsTooltipComponent;
  let fixture: ComponentFixture<TabsTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

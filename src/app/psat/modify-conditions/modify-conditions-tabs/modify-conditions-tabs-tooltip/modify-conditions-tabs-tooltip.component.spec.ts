import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyConditionsTabsTooltipComponent } from './modify-conditions-tabs-tooltip.component';

describe('ModifyConditionsTabsTooltipComponent', () => {
  let component: ModifyConditionsTabsTooltipComponent;
  let fixture: ComponentFixture<ModifyConditionsTabsTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyConditionsTabsTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyConditionsTabsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

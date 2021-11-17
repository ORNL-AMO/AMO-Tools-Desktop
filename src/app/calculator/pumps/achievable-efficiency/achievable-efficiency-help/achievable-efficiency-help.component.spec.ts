import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievableEfficiencyHelpComponent } from './achievable-efficiency-help.component';

describe('AchievableEfficiencyHelpComponent', () => {
  let component: AchievableEfficiencyHelpComponent;
  let fixture: ComponentFixtureAchievableEfficiencyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievableEfficiencyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievableEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

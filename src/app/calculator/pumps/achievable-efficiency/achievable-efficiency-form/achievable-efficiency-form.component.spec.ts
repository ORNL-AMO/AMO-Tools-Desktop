import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievableEfficiencyFormComponent } from './achievable-efficiency-form.component';

describe('AchievableEfficiencyFormComponent', () => {
  let component: AchievableEfficiencyFormComponent;
  let fixture: ComponentFixture<AchievableEfficiencyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievableEfficiencyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievableEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

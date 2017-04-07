import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievableEfficiencyComponent } from './achievable-efficiency.component';

describe('AchievableEfficiencyComponent', () => {
  let component: AchievableEfficiencyComponent;
  let fixture: ComponentFixture<AchievableEfficiencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievableEfficiencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievableEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

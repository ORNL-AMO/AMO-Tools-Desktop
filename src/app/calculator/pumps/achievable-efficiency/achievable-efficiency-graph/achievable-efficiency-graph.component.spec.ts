import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievableEfficiencyGraphComponent } from './achievable-efficiency-graph.component';

describe('AchievableEfficiencyGraphComponent', () => {
  let component: AchievableEfficiencyGraphComponent;
  let fixture: ComponentFixture<AchievableEfficiencyGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievableEfficiencyGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievableEfficiencyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

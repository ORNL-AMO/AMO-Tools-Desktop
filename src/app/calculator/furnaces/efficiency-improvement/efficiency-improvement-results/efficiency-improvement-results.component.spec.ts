import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyImprovementResultsComponent } from './efficiency-improvement-results.component';

describe('EfficiencyImprovementResultsComponent', () => {
  let component: EfficiencyImprovementResultsComponent;
  let fixture: ComponentFixture<EfficiencyImprovementResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EfficiencyImprovementResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyImprovementResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

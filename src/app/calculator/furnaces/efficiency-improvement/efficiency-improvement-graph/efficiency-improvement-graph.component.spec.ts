import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyImprovementGraphComponent } from './efficiency-improvement-graph.component';

describe('EfficiencyImprovementGraphComponent', () => {
  let component: EfficiencyImprovementGraphComponent;
  let fixture: ComponentFixture<EfficiencyImprovementGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficiencyImprovementGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyImprovementGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

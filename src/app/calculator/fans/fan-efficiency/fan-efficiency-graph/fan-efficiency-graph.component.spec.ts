import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanEfficiencyGraphComponent } from './fan-efficiency-graph.component';

describe('FanEfficiencyGraphComponent', () => {
  let component: FanEfficiencyGraphComponent;
  let fixture: ComponentFixture<FanEfficiencyGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanEfficiencyGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanEfficiencyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

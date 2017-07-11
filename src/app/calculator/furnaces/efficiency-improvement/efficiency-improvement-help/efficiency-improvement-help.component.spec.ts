import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyImprovementHelpComponent } from './efficiency-improvement-help.component';

describe('EfficiencyImprovementHelpComponent', () => {
  let component: EfficiencyImprovementHelpComponent;
  let fixture: ComponentFixture<EfficiencyImprovementHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficiencyImprovementHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyImprovementHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

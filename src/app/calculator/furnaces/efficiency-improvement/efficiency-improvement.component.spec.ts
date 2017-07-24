import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyImprovementComponent } from './efficiency-improvement.component';

describe('EfficiencyImprovementComponent', () => {
  let component: EfficiencyImprovementComponent;
  let fixture: ComponentFixture<EfficiencyImprovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficiencyImprovementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyImprovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

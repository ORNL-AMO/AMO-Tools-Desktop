import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyImprovementFormComponent } from './efficiency-improvement-form.component';

describe('EfficiencyImprovementFormComponent', () => {
  let component: EfficiencyImprovementFormComponent;
  let fixture: ComponentFixture<EfficiencyImprovementFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficiencyImprovementFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyImprovementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

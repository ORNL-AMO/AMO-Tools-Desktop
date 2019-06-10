import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanEfficiencyFormComponent } from './fan-efficiency-form.component';

describe('FanEfficiencyFormComponent', () => {
  let component: FanEfficiencyFormComponent;
  let fixture: ComponentFixture<FanEfficiencyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanEfficiencyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

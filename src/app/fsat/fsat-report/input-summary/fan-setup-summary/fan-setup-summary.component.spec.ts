import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSetupSummaryComponent } from './fan-setup-summary.component';

describe('FanSetupSummaryComponent', () => {
  let component: FanSetupSummaryComponent;
  let fixture: ComponentFixture<FanSetupSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanSetupSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSetupSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

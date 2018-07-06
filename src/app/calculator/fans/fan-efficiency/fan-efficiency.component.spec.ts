import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanEfficiencyComponent } from './fan-efficiency.component';

describe('FanEfficiencyComponent', () => {
  let component: FanEfficiencyComponent;
  let fixture: ComponentFixture<FanEfficiencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanEfficiencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

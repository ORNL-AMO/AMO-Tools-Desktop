import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemEfficiencyTabComponent } from './system-efficiency-tab.component';

describe('SystemEfficiencyTabComponent', () => {
  let component: SystemEfficiencyTabComponent;
  let fixture: ComponentFixture<SystemEfficiencyTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemEfficiencyTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemEfficiencyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

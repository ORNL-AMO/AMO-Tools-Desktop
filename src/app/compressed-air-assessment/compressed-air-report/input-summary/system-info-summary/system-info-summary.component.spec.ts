import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInfoSummaryComponent } from './system-info-summary.component';

describe('SystemInfoSummaryComponent', () => {
  let component: SystemInfoSummaryComponent;
  let fixture: ComponentFixture<SystemInfoSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemInfoSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemInfoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

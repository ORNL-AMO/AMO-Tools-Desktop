import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProfilesComponent } from './performance-profiles.component';

describe('PerformanceProfilesComponent', () => {
  let component: PerformanceProfilesComponent;
  let fixture: ComponentFixture<PerformanceProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformanceProfilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

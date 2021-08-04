import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeakageResultsComponent } from './leakage-results.component';

describe('LeakageResultsComponent', () => {
  let component: LeakageResultsComponent;
  let fixture: ComponentFixture<LeakageResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeakageResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeakageResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

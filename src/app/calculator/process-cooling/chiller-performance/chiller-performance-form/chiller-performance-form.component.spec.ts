import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerPerformanceFormComponent } from './chiller-performance-form.component';

describe('ChillerPerformanceFormComponent', () => {
  let component: ChillerPerformanceFormComponent;
  let fixture: ComponentFixture<ChillerPerformanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerPerformanceFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerPerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

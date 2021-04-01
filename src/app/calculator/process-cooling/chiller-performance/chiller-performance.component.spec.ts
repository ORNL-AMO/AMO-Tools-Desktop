import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerPerformanceComponent } from './chiller-performance.component';

describe('ChillerPerformanceComponent', () => {
  let component: ChillerPerformanceComponent;
  let fixture: ComponentFixture<ChillerPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerPerformanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

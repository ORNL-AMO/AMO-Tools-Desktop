import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerPerformanceHelpComponent } from './chiller-performance-help.component';

describe('ChillerPerformanceHelpComponent', () => {
  let component: ChillerPerformanceHelpComponent;
  let fixture: ComponentFixture<ChillerPerformanceHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerPerformanceHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerPerformanceHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveSummaryComponent } from './executive-summary.component';

describe('ExecutiveSummaryComponent', () => {
  let component: ExecutiveSummaryComponent;
  let fixture: ComponentFixture<ExecutiveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutiveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

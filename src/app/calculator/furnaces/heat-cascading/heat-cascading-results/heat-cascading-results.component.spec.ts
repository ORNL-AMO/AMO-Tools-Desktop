import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatCascadingResultsComponent } from './heat-cascading-results.component';

describe('HeatCascadingResultsComponent', () => {
  let component: HeatCascadingResultsComponent;
  let fixture: ComponentFixture<HeatCascadingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatCascadingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatCascadingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerStagingResultsComponent } from './chiller-staging-results.component';

describe('ChillerStagingResultsComponent', () => {
  let component: ChillerStagingResultsComponent;
  let fixture: ComponentFixture<ChillerStagingResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerStagingResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerStagingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

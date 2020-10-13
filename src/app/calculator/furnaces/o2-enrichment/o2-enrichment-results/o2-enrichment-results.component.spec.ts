import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentResultsComponent } from './o2-enrichment-results.component';

describe('O2EnrichmentResultsComponent', () => {
  let component: O2EnrichmentResultsComponent;
  let fixture: ComponentFixture<O2EnrichmentResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

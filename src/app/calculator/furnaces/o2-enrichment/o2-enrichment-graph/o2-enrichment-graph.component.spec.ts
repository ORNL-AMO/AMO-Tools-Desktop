import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentGraphComponent } from './o2-enrichment-graph.component';

describe('O2EnrichmentGraphComponent', () => {
  let component: O2EnrichmentGraphComponent;
  let fixture: ComponentFixture<O2EnrichmentGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

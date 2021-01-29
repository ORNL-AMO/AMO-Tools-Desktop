import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentGraphComponent } from './enrichment-graph.component';

describe('EnrichmentGraphComponent', () => {
  let component: EnrichmentGraphComponent;
  let fixture: ComponentFixture<EnrichmentGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentCopyTableComponent } from './o2-enrichment-copy-table.component';

describe('O2EnrichmentCopyTableComponent', () => {
  let component: O2EnrichmentCopyTableComponent;
  let fixture: ComponentFixture<O2EnrichmentCopyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentCopyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentCopyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

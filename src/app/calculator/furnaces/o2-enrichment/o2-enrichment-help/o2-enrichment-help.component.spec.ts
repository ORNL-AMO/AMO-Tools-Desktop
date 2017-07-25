import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentHelpComponent } from './o2-enrichment-help.component';

describe('O2EnrichmentHelpComponent', () => {
  let component: O2EnrichmentHelpComponent;
  let fixture: ComponentFixture<O2EnrichmentHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

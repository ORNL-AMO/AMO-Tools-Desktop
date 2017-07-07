import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentComponent } from './o2-enrichment.component';

describe('O2EnrichmentComponent', () => {
  let component: O2EnrichmentComponent;
  let fixture: ComponentFixture<O2EnrichmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { O2EnrichmentFormComponent } from './o2-enrichment-form.component';

describe('O2EnrichmentFormComponent', () => {
  let component: O2EnrichmentFormComponent;
  let fixture: ComponentFixture<O2EnrichmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ O2EnrichmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(O2EnrichmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

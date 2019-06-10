import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanarResultsComponent } from './planar-results.component';

describe('PlanarResultsComponent', () => {
  let component: PlanarResultsComponent;
  let fixture: ComponentFixture<PlanarResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanarResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanarResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedSurfaceSummaryComponent } from './extended-surface-summary.component';

describe('ExtendedSurfaceSummaryComponent', () => {
  let component: ExtendedSurfaceSummaryComponent;
  let fixture: ComponentFixture<ExtendedSurfaceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedSurfaceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedSurfaceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

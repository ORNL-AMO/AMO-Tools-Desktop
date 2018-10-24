import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingReplacementResultsComponent } from './lighting-replacement-results.component';

describe('LightingReplacementResultsComponent', () => {
  let component: LightingReplacementResultsComponent;
  let fixture: ComponentFixture<LightingReplacementResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingReplacementResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingReplacementResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

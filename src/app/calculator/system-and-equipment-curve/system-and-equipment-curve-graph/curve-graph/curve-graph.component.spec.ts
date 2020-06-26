import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurveGraphComponent } from './curve-graph.component';

describe('CurveGraphComponent', () => {
  let component: CurveGraphComponent;
  let fixture: ComponentFixture<CurveGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurveGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

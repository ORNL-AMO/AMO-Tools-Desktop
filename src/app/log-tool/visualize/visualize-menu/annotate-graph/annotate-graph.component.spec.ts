import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateGraphComponent } from './annotate-graph.component';

describe('AnnotateGraphComponent', () => {
  let component: AnnotateGraphComponent;
  let fixture: ComponentFixture<AnnotateGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotateGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotateGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

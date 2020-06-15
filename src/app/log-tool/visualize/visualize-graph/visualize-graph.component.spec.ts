import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeGraphComponent } from './visualize-graph.component';

describe('VisualizeGraphComponent', () => {
  let component: VisualizeGraphComponent;
  let fixture: ComponentFixture<VisualizeGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizeGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

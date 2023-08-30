import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDataSelectionComponent } from './graph-data-selection.component';

describe('GraphDataSelectionComponent', () => {
  let component: GraphDataSelectionComponent;
  let fixture: ComponentFixture<GraphDataSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphDataSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphDataSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

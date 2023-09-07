import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphAnnotationsComponent } from './graph-annotations.component';

describe('GraphAnnotationsComponent', () => {
  let component: GraphAnnotationsComponent;
  let fixture: ComponentFixture<GraphAnnotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphAnnotationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

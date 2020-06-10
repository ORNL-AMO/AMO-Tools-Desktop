import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphBasicsComponent } from './graph-basics.component';

describe('GraphBasicsComponent', () => {
  let component: GraphBasicsComponent;
  let fixture: ComponentFixture<GraphBasicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphBasicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

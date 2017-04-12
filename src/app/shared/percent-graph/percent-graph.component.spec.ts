import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentGraphComponent } from './percent-graph.component';

describe('PercentGraphComponent', () => {
  let component: PercentGraphComponent;
  let fixture: ComponentFixture<PercentGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

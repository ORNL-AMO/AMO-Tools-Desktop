import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterfallGraphComponent } from './waterfall-graph.component';

describe('WaterfallGraphComponent', () => {
  let component: WaterfallGraphComponent;
  let fixture: ComponentFixture<WaterfallGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterfallGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterfallGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

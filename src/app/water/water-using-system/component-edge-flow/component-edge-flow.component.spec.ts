import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentEdgeFlowComponent } from './component-edge-flow.component';

describe('ComponentEdgeFlowComponent', () => {
  let component: ComponentEdgeFlowComponent;
  let fixture: ComponentFixture<ComponentEdgeFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentEdgeFlowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentEdgeFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

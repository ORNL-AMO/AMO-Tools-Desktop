import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowReallocationComponent } from './flow-reallocation.component';

describe('FlowReallocationComponent', () => {
  let component: FlowReallocationComponent;
  let fixture: ComponentFixture<FlowReallocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowReallocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowReallocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

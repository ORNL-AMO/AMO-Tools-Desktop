import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaxFullFlowComponent } from './max-full-flow.component';

describe('MaxFullFlowComponent', () => {
  let component: MaxFullFlowComponent;
  let fixture: ComponentFixture<MaxFullFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaxFullFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaxFullFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

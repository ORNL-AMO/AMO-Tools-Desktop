import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackLossFormComponent } from './stack-loss-form.component';

describe('StackLossFormComponent', () => {
  let component: StackLossFormComponent;
  let fixture: ComponentFixture<StackLossFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackLossFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackLossFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

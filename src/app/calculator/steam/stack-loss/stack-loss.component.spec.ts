import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackLossComponent } from './stack-loss.component';

describe('StackLossComponent', () => {
  let component: StackLossComponent;
  let fixture: ComponentFixture<StackLossComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackLossComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

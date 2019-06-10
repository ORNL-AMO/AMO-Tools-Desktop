import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackLossHelpComponent } from './stack-loss-help.component';

describe('StackLossHelpComponent', () => {
  let component: StackLossHelpComponent;
  let fixture: ComponentFixture<StackLossHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackLossHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackLossHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

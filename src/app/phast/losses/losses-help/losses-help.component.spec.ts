import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesHelpComponent } from './losses-help.component';

describe('LossesHelpComponent', () => {
  let component: LossesHelpComponent;
  let fixture: ComponentFixture<LossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

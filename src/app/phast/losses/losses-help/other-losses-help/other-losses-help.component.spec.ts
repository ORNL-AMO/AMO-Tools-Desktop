import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherLossesHelpComponent } from './other-losses-help.component';

describe('OtherLossesHelpComponent', () => {
  let component: OtherLossesHelpComponent;
  let fixture: ComponentFixture<OtherLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

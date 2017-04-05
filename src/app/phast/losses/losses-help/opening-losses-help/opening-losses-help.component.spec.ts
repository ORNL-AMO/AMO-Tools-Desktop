import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningLossesHelpComponent } from './opening-losses-help.component';

describe('OpeningLossesHelpComponent', () => {
  let component: OpeningLossesHelpComponent;
  let fixture: ComponentFixture<OpeningLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpeningLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

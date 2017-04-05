import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureLossesHelpComponent } from './fixture-losses-help.component';

describe('FixtureLossesHelpComponent', () => {
  let component: FixtureLossesHelpComponent;
  let fixture: ComponentFixture<FixtureLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

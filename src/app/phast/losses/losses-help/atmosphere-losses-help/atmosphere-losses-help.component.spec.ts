import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereLossesHelpComponent } from './atmosphere-losses-help.component';

describe('AtmosphereLossesHelpComponent', () => {
  let component: AtmosphereLossesHelpComponent;
  let fixture: ComponentFixture<AtmosphereLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

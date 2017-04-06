import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesHelpComponent } from './wall-losses-help.component';

describe('WallLossesHelpComponent', () => {
  let component: WallLossesHelpComponent;
  let fixture: ComponentFixture<WallLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

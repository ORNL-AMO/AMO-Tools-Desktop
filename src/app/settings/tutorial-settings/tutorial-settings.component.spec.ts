import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialSettingsComponent } from './tutorial-settings.component';

describe('TutorialSettingsComponent', () => {
  let component: TutorialSettingsComponent;
  let fixture: ComponentFixture<TutorialSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

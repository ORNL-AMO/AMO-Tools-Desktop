import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningTutorialComponent } from './opening-tutorial.component';

describe('OpeningTutorialComponent', () => {
  let component: OpeningTutorialComponent;
  let fixture: ComponentFixture<OpeningTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpeningTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

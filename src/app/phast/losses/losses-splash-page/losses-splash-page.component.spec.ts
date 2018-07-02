import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesSplashPageComponent } from './losses-splash-page.component';

describe('LossesSplashPageComponent', () => {
  let component: LossesSplashPageComponent;
  let fixture: ComponentFixture<LossesSplashPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesSplashPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesSplashPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

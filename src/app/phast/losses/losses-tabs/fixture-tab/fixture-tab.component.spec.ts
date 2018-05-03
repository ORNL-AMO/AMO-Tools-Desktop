import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureTabComponent } from './fixture-tab.component';

describe('FixtureTabComponent', () => {
  let component: FixtureTabComponent;
  let fixture: ComponentFixture<FixtureTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

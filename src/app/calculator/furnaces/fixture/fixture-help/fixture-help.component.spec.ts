import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureHelpComponent } from './fixture-help.component';

describe('FixtureHelpComponent', () => {
  let component: FixtureHelpComponent;
  let fixture: ComponentFixture<FixtureHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixtureHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

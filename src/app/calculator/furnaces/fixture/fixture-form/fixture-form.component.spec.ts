import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureFormComponent } from './fixture-form.component';

describe('FixtureFormComponent', () => {
  let component: FixtureFormComponent;
  let fixture: ComponentFixture<FixtureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixtureFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

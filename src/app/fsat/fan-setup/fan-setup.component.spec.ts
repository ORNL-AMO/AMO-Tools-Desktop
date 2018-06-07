import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSetupComponent } from './fan-setup.component';

describe('FanSetupComponent', () => {
  let component: FanSetupComponent;
  let fixture: ComponentFixture<FanSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSetupHelpComponent } from './fan-setup-help.component';

describe('FanSetupHelpComponent', () => {
  let component: FanSetupHelpComponent;
  let fixture: ComponentFixture<FanSetupHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanSetupHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSetupHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

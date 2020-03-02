import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtSystemSetupTutorialComponent } from './ssmt-system-setup-tutorial.component';

describe('SsmtSystemSetupTutorialComponent', () => {
  let component: SsmtSystemSetupTutorialComponent;
  let fixture: ComponentFixture<SsmtSystemSetupTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtSystemSetupTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtSystemSetupTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

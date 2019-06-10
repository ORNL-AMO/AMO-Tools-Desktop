import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastSetupTutorialComponent } from './phast-setup-tutorial.component';

describe('PhastSetupTutorialComponent', () => {
  let component: PhastSetupTutorialComponent;
  let fixture: ComponentFixture<PhastSetupTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastSetupTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastSetupTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

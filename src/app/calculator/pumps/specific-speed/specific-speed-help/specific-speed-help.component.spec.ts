import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificSpeedHelpComponent } from './specific-speed-help.component';

describe('SpecificSpeedHelpComponent', () => {
  let component: SpecificSpeedHelpComponent;
  let fixture: ComponentFixture<SpecificSpeedHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificSpeedHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificSpeedHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInformationHelpComponent } from './system-information-help.component';

describe('SystemInformationHelpComponent', () => {
  let component: SystemInformationHelpComponent;
  let fixture: ComponentFixture<SystemInformationHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemInformationHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemInformationHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

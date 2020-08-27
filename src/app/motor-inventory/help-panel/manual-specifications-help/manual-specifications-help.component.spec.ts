import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSpecificationsHelpComponent } from './manual-specifications-help.component';

describe('ManualSpecificationsHelpComponent', () => {
  let component: ManualSpecificationsHelpComponent;
  let fixture: ComponentFixture<ManualSpecificationsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualSpecificationsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualSpecificationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

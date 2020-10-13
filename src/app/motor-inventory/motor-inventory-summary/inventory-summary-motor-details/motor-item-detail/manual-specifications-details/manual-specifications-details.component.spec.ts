import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSpecificationsDetailsComponent } from './manual-specifications-details.component';

describe('ManualSpecificationsDetailsComponent', () => {
  let component: ManualSpecificationsDetailsComponent;
  let fixture: ComponentFixture<ManualSpecificationsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualSpecificationsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualSpecificationsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

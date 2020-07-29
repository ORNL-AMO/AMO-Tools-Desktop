import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSpecificationsTableComponent } from './manual-specifications-table.component';

describe('ManualSpecificationsTableComponent', () => {
  let component: ManualSpecificationsTableComponent;
  let fixture: ComponentFixture<ManualSpecificationsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualSpecificationsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualSpecificationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

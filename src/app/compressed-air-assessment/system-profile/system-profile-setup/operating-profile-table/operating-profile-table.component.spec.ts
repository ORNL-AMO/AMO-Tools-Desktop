import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingProfileTableComponent } from './operating-profile-table.component';

describe('OperatingProfileTableComponent', () => {
  let component: OperatingProfileTableComponent;
  let fixture: ComponentFixture<OperatingProfileTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatingProfileTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingProfileTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

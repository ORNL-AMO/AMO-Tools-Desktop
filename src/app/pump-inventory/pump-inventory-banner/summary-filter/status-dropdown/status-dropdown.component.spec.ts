import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusDropdownComponent } from './status-dropdown.component';

describe('StatusDropdownComponent', () => {
  let component: StatusDropdownComponent;
  let fixture: ComponentFixture<StatusDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

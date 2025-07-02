import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemDropdownComponent } from './system-dropdown.component';

describe('SystemDropdownComponent', () => {
  let component: SystemDropdownComponent;
  let fixture: ComponentFixture<SystemDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlTypeDropdownComponent } from './control-type-dropdown.component';

describe('ControlTypeDropdownComponent', () => {
  let component: ControlTypeDropdownComponent;
  let fixture: ComponentFixture<ControlTypeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlTypeDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlTypeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

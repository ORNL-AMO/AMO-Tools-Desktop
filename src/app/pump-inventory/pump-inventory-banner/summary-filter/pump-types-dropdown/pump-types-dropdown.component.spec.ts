import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpTypesDropdownComponent } from './pump-types-dropdown.component';

describe('PumpTypesDropdownComponent', () => {
  let component: PumpTypesDropdownComponent;
  let fixture: ComponentFixture<PumpTypesDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpTypesDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpTypesDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

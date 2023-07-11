import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatedPowerDropdownComponent } from './rated-power-dropdown.component';

describe('RatedPowerDropdownComponent', () => {
  let component: RatedPowerDropdownComponent;
  let fixture: ComponentFixture<RatedPowerDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatedPowerDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatedPowerDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

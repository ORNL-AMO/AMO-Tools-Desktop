import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorsepowerDropdownComponent } from './horsepower-dropdown.component';

describe('HorsepowerDropdownComponent', () => {
  let component: HorsepowerDropdownComponent;
  let fixture: ComponentFixture<HorsepowerDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorsepowerDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorsepowerDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

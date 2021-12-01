import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsHelpComponent } from './co2-savings-help.component';

describe('Co2SavingsHelpComponent', () => {
  let component: Co2SavingsHelpComponent;
  let fixture: ComponentFixture<Co2SavingsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Co2SavingsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2SavingsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFormatHelpComponent } from './date-format-help.component';

describe('DateFormatHelpComponent', () => {
  let component: DateFormatHelpComponent;
  let fixture: ComponentFixture<DateFormatHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateFormatHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateFormatHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

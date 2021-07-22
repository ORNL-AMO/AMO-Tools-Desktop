import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypesHelpComponent } from './day-types-help.component';

describe('DayTypesHelpComponent', () => {
  let component: DayTypesHelpComponent;
  let fixture: ComponentFixture<DayTypesHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayTypesHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

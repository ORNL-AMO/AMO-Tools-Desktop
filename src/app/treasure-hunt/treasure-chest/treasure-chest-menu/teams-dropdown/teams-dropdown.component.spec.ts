import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsDropdownComponent } from './teams-dropdown.component';

describe('TeamsDropdownComponent', () => {
  let component: TeamsDropdownComponent;
  let fixture: ComponentFixture<TeamsDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

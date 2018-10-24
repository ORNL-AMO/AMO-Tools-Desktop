import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyConditionsNotesComponent } from './modify-conditions-notes.component';

describe('ModifyConditionsNotesComponent', () => {
  let component: ModifyConditionsNotesComponent;
  let fixture: ComponentFixture<ModifyConditionsNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyConditionsNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyConditionsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

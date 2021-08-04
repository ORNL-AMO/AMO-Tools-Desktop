import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistFormComponent } from './fan-system-checklist-form.component';

describe('FanSystemChecklistFormComponent', () => {
  let component: FanSystemChecklistFormComponent;
  let fixture: ComponentFixture<FanSystemChecklistFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

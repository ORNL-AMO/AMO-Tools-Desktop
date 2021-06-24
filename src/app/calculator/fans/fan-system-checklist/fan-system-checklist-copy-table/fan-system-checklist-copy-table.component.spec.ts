import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistCopyTableComponent } from './fan-system-checklist-copy-table.component';

describe('FanSystemChecklistCopyTableComponent', () => {
  let component: FanSystemChecklistCopyTableComponent;
  let fixture: ComponentFixture<FanSystemChecklistCopyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistCopyTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistCopyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrueCostEditableTableComponent } from './true-cost-editable-table.component';

describe('TrueCostEditableTableComponent', () => {
  let component: TrueCostEditableTableComponent;
  let fixture: ComponentFixture<TrueCostEditableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrueCostEditableTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrueCostEditableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

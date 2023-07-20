import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldUnitsModalComponent } from './field-units-modal.component';

describe('FieldUnitsModalComponent', () => {
  let component: FieldUnitsModalComponent;
  let fixture: ComponentFixture<FieldUnitsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldUnitsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldUnitsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

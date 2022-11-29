import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDataHeaderComponent } from './select-data-header.component';

describe('SelectDataHeaderComponent', () => {
  let component: SelectDataHeaderComponent;
  let fixture: ComponentFixture<SelectDataHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDataHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDataHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

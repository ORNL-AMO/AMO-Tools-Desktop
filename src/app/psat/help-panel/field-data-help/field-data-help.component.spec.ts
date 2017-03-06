import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldDataHelpComponent } from './field-data-help.component';

describe('FieldDataHelpComponent', () => {
  let component: FieldDataHelpComponent;
  let fixture: ComponentFixture<FieldDataHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldDataHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

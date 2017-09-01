import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitConverterComponent } from './unit-converter.component';

describe('UnitConverterComponent', () => {
  let component: UnitConverterComponent;
  let fixture: ComponentFixture<UnitConverterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitConverterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

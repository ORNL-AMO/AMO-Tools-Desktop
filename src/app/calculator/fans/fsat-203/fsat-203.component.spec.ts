import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Fsat203Component } from './fsat-203.component';

describe('Fsat203Component', () => {
  let component: Fsat203Component;
  let fixture: ComponentFixture<Fsat203Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Fsat203Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Fsat203Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

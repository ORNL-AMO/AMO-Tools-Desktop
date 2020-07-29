import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherTableComponent } from './other-table.component';

describe('OtherTableComponent', () => {
  let component: OtherTableComponent;
  let fixture: ComponentFixture<OtherTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

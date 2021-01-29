import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherDataComponent } from './other-data.component';

describe('OtherDataComponent', () => {
  let component: OtherDataComponent;
  let fixture: ComponentFixture<OtherDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

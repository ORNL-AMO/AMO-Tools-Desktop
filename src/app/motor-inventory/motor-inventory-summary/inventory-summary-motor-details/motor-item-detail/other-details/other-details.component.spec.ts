import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherDetailsComponent } from './other-details.component';

describe('OtherDetailsComponent', () => {
  let component: OtherDetailsComponent;
  let fixture: ComponentFixture<OtherDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

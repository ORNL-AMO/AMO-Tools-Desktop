import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherHelpComponent } from './other-help.component';

describe('OtherHelpComponent', () => {
  let component: OtherHelpComponent;
  let fixture: ComponentFixture<OtherHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

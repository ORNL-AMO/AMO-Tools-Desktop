import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorHelpComponent } from './deaerator-help.component';

describe('DeaeratorHelpComponent', () => {
  let component: DeaeratorHelpComponent;
  let fixture: ComponentFixture<DeaeratorHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorComponent } from './deaerator.component';

describe('DeaeratorComponent', () => {
  let component: DeaeratorComponent;
  let fixture: ComponentFixture<DeaeratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

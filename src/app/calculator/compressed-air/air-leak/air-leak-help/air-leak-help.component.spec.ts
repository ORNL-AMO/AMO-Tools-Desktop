import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakHelpComponent } from './air-leak-help.component';

describe('AirLeakHelpComponent', () => {
  let component: AirLeakHelpComponent;
  let fixture: ComponentFixture<AirLeakHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

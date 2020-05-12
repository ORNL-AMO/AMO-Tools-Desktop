import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakComponent } from './air-leak.component';

describe('AirLeakComponent', () => {
  let component: AirLeakComponent;
  let fixture: ComponentFixture<AirLeakComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

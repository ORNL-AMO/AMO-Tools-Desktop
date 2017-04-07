import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificSpeedComponent } from './specific-speed.component';

describe('SpecificSpeedComponent', () => {
  let component: SpecificSpeedComponent;
  let fixture: ComponentFixture<SpecificSpeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificSpeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificSpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

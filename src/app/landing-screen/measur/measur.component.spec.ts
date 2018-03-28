import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurComponent } from './measur.component';

describe('MeasurComponent', () => {
  let component: MeasurComponent;
  let fixture: ComponentFixture<MeasurComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasurComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanFieldDataComponent } from './fan-field-data.component';

describe('FanFieldDataComponent', () => {
  let component: FanFieldDataComponent;
  let fixture: ComponentFixture<FanFieldDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanFieldDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanFieldDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

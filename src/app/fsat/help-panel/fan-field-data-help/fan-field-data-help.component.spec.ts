import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanFieldDataHelpComponent } from './fan-field-data-help.component';

describe('FanFieldDataHelpComponent', () => {
  let component: FanFieldDataHelpComponent;
  let fixture: ComponentFixture<FanFieldDataHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanFieldDataHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanFieldDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

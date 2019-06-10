import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanDataHelpComponent } from './fan-data-help.component';

describe('FanDataHelpComponent', () => {
  let component: FanDataHelpComponent;
  let fixture: ComponentFixture<FanDataHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanDataHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

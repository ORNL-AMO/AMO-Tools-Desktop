import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlDataHelpComponent } from './control-data-help.component';

describe('ControlDataHelpComponent', () => {
  let component: ControlDataHelpComponent;
  let fixture: ComponentFixture<ControlDataHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlDataHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

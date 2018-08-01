import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineHelpComponent } from './turbine-help.component';

describe('TurbineHelpComponent', () => {
  let component: TurbineHelpComponent;
  let fixture: ComponentFixture<TurbineHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

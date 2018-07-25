import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerHelpComponent } from './boiler-help.component';

describe('BoilerHelpComponent', () => {
  let component: BoilerHelpComponent;
  let fixture: ComponentFixture<BoilerHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

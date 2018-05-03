import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralMethodHelpComponent } from './general-method-help.component';

describe('GeneralMethodHelpComponent', () => {
  let component: GeneralMethodHelpComponent;
  let fixture: ComponentFixture<GeneralMethodHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralMethodHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralMethodHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayMethodHelpComponent } from './delay-method-help.component';

describe('DelayMethodHelpComponent', () => {
  let component: DelayMethodHelpComponent;
  let fixture: ComponentFixture<DelayMethodHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelayMethodHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayMethodHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

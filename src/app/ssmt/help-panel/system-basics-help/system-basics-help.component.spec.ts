import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemBasicsHelpComponent } from './system-basics-help.component';

describe('SystemBasicsHelpComponent', () => {
  let component: SystemBasicsHelpComponent;
  let fixture: ComponentFixture<SystemBasicsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemBasicsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemBasicsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

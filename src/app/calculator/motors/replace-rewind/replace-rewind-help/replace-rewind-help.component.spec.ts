import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceRewindHelpComponent } from './replace-rewind-help.component';

describe('ReplaceRewindHelpComponent', () => {
  let component: ReplaceRewindHelpComponent;
  let fixture: ComponentFixture<ReplaceRewindHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceRewindHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceRewindHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

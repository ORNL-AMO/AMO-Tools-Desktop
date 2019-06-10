import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceRewindFormComponent } from './replace-rewind-form.component';

describe('ReplaceRewindFormComponent', () => {
  let component: ReplaceRewindFormComponent;
  let fixture: ComponentFixture<ReplaceRewindFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceRewindFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceRewindFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

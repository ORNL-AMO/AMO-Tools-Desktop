import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceRewindComponent } from './replace-rewind.component';

describe('ReplaceRewindComponent', () => {
  let component: ReplaceRewindComponent;
  let fixture: ComponentFixture<ReplaceRewindComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceRewindComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceRewindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

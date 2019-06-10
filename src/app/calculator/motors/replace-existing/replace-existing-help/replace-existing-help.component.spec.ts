import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceExistingHelpComponent } from './replace-existing-help.component';

describe('ReplaceExistingHelpComponent', () => {
  let component: ReplaceExistingHelpComponent;
  let fixture: ComponentFixture<ReplaceExistingHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceExistingHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceExistingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

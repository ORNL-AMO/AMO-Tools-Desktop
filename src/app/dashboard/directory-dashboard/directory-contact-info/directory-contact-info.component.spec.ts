import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryContactInfoComponent } from './directory-contact-info.component';

describe('DirectoryContactInfoComponent', () => {
  let component: DirectoryContactInfoComponent;
  let fixture: ComponentFixture<DirectoryContactInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryContactInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

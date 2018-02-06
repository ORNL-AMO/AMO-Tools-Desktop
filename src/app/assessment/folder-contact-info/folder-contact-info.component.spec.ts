import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderContactInfoComponent } from './folder-contact-info.component';

describe('FolderContactInfoComponent', () => {
  let component: FolderContactInfoComponent;
  let fixture: ComponentFixture<FolderContactInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderContactInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

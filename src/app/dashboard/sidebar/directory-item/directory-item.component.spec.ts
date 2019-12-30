import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryItemComponent } from './directory-item.component';

describe('DirectoryItemComponent', () => {
  let component: DirectoryItemComponent;
  let fixture: ComponentFixture<DirectoryItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

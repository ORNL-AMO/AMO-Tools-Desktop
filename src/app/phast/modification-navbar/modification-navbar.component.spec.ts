import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationNavbarComponent } from './modification-navbar.component';

describe('ModificationNavbarComponent', () => {
  let component: ModificationNavbarComponent;
  let fixture: ComponentFixture<ModificationNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificationNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificationNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

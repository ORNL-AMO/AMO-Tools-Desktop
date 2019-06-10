import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatComponent } from './fsat.component';

describe('FsatComponent', () => {
  let component: FsatComponent;
  let fixture: ComponentFixture<FsatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

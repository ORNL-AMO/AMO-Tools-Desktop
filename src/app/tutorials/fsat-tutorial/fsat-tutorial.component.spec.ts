import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatTutorialComponent } from './fsat-tutorial.component';

describe('FsatTutorialComponent', () => {
  let component: FsatTutorialComponent;
  let fixture: ComponentFixture<FsatTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

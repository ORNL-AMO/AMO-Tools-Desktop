import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatBasicsHelpComponent } from './fsat-basics-help.component';

describe('FsatBasicsHelpComponent', () => {
  let component: FsatBasicsHelpComponent;
  let fixture: ComponentFixture<FsatBasicsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatBasicsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatBasicsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

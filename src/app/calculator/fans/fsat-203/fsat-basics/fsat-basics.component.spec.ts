import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatBasicsComponent } from './fsat-basics.component';

describe('FsatBasicsComponent', () => {
  let component: FsatBasicsComponent;
  let fixture: ComponentFixture<FsatBasicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatBasicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

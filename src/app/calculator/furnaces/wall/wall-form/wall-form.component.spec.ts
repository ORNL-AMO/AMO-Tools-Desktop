import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallFormComponent } from './wall-form.component';

describe('WallFormComponent', () => {
  let component: WallFormComponent;
  let fixture: ComponentFixture<WallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WallFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

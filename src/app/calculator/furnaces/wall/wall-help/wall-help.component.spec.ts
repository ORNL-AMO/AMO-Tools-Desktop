import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallHelpComponent } from './wall-help.component';

describe('WallHelpComponent', () => {
  let component: WallHelpComponent;
  let fixture: ComponentFixture<WallHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WallHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WallHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

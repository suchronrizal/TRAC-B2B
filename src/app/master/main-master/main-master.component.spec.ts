import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMasterComponent } from './main-master.component';

describe('MainMasterComponent', () => {
  let component: MainMasterComponent;
  let fixture: ComponentFixture<MainMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

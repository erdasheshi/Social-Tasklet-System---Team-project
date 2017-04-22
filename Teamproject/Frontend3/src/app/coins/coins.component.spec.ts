/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoinsComponent } from './coins.component';

describe('CoinsComponent', () => {
  let component: CoinsComponent;
  let fixture: ComponentFixture<CoinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { RegisterComponent } from './register/register.component';
import { NetworkComponent } from './network/network.component';
import { CoinsComponent } from './coins/coins.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TransactionsComponent,
    RegisterComponent,
    CoinsComponent,
    NetworkComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        'path': '',
        'component': LoginComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'register',
        'component': RegisterComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'transactions',
        'component': TransactionsComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'network',
        'component': NetworkComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'coins',
        'component': CoinsComponent,
        'pathMatch': 'full'
      }

    ], {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component, Inject, OnInit } from '@angular/core';
//import { OktaAuth } from '@okta/okta-auth-js';

import { OktaAuthService } from '@okta/okta-angular';

import { throwError } from 'rxjs';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: Boolean | undefined;
  fullUserName: string | undefined;

  constructor(private OktaService: OktaAuthService) { }

  ngOnInit(): void {
    this.OktaService.authStateManager.subscribe(
      (result) => {
        this.isAuthenticated = result;
        this.getUserDetails();
      }
    )

  }
  getUserDetails() {
    if (this.isAuthenticated) {
      this.OktaService.getUser().then(
        (res) => {
          //this.isAuthenticated=true;
          this.fullUserName = res.name;
        }

      )
    }

  }
  logout() {
    //  terminate session  and remove tokens
    this.OktaService.signOut();
  }
  setAuthenticated(){
    if(this.isAuthenticated){
      this.isAuthenticated = false;
    }else{
      this.isAuthenticated = true;
    }
    
  }
}



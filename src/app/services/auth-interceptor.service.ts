import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthModule, OktaAuthService } from '@okta/okta-angular';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth: OktaAuthService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handlerequest(req, next));
  }
  private handlerequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //only add token to secured endPoints
    const theEndPoint =environment.theApiBaseUrl+'/orders';
    const securedEndPoints = [theEndPoint];

    if (securedEndPoints.some(url => req.urlWithParams.includes(url))) {
      //get access token
      const accessToken = this.oktaAuth.getAccessToken();
    // console.log('acess token ' + accessToken);
   
      req= req.clone({
        setHeaders: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
    }
          

     
    return next.handle(req);

  }
}

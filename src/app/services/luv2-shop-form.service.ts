import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesUrl: string = environment.theApiBaseUrl+"/countries";
  private statesUrl: string = environment.theApiBaseUrl+"/states";


  constructor(private httpClient: HttpClient) {

  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(
        response => response._embedded.countries)
    );

  }

  getAllStates(): Observable<State[]> {
    return this.httpClient.get<GetResponseStates>(this.statesUrl).pipe(
      map(
        response => response._embedded.states)
    );

  }
  getStates(theCountryCode : string): Observable<State[]> {
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseStates>(searchStateUrl).pipe(
      map(
        response => response._embedded.states)
    );

  }

getCreditCardMonths(startMonth: number): Observable < number[] > {
  let data: number[] = [];

  for(let currMonth = startMonth; currMonth <= 12; currMonth++) {

  data.push(currMonth);
}

return of(data);
  }

getCreditCardYears() {
  let data: number[] = [];
  const theSartYear: number = new Date().getFullYear();
  const endYear = theSartYear + 10;
  for (let currYear = theSartYear; currYear <= endYear; currYear++) {
    data.push(currYear);
  }

  return of(data);

}
}


interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}
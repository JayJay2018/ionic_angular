import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// [
//   new Place(
//     'p1',
//     'Borsthusen Mansion',
//     'A lovely place in nature near the sea.',
//     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
//     221.99,
//     new Date ('2019-01-01'),
//     new Date ('2019-12-31'),
//     'xay'
//   ),
//   new Place(
//     'p2',
//     'Neustadt Pleasure',
//     'The go-to spot in Hamburg downtown',
//     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
//     129.99,
//     new Date ('2019-02-01'),
//     new Date ('2019-4-13'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'Rüdesheimer Winery',
//     'An antic and historical palce in the heart of the Rheingau region',
//     'https://cdn.magdeleine.co/wp-content/uploads/2018/08/381H-1400x933.jpg',
//     179.99,
//     new Date ('2019-07-01'),
//     new Date ('2019-12-15'),
//     'xay'
//   ),
//   new Place(
//     'p4',
//     'Modern tree house',
//     'Live like a nomad in the middle of nowhere.',
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
//     39.99,
//     new Date ('2019-09-01'),
//     new Date ('2019-12-31'),
//     'abc'
//   )
// ]

interface PLACEDATA {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([])

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get places() {
    return this._places.asObservable();
  }

  fetchPLaces() {
    return this.authService.token.pipe(take(1), switchMap( userToken => {
      return this.http.get<{[key: string]: PLACEDATA}>(`https://ionic-angular-jascha.firebaseio.com/offered-places.json?auth=${userToken}`
      );
    }),
    map(resData => {
      const places = []
      console.log(resData);
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(
            new Place(
              key, 
              resData[key].title, 
              resData[key].description, 
              resData[key].imageUrl, 
              resData[key].price, 
              new Date(resData[key].availableFrom), 
              new Date(resData[key].availableTo), 
              resData[key].userId ))
        }
      }
      return places;
    }),
    tap( places => {
      this._places.next(places);
    })
    )
  }

  getPlace(id: string) {
    return this.authService.token.pipe(take(1), switchMap(userToken => {
      return this.http.get<PLACEDATA>(`https://ionic-angular-jascha.firebaseio.com/offered-places/${id}.json?auth=${userToken}`)
    }),
      map(placeData => {
        return new Place(
          id, 
          placeData.title, 
          placeData.description, 
          placeData.imageUrl, 
          placeData.price, 
          new Date(placeData.availableFrom), 
          new Date(placeData.availableTo), 
          placeData.userId)
      })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    let fetchedUserId: string;
    let fetchedNewPlace: Place;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      fetchedUserId = userId;
      return this.authService.token.pipe(take(1), switchMap(userToken => {
        fetchedNewPlace = new Place(
         Math.random().toString(),
         title,
         description,
         'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
         price,
         dateFrom,
         dateTo,
         userId
       );
       return this.http.post<{ name: string}>(`https://ionic-angular-jascha.firebaseio.com/offered-places.json?auth=${userToken}`, {
         ...fetchedNewPlace, id: null
       })
      }))
    }),
      switchMap( resData => {
        generatedId = resData.name;
        return this.places;
    }),
    take(1),
    tap( places => {
      fetchedNewPlace.id = generatedId;
      this._places.next(places.concat(fetchedNewPlace))
    })
    )
  }

    updatePlace(placeId: string, title: string, description: string, dateFrom: Date, dateTo: Date) {
      let updatedPlaces: Place[];
      return this.places.pipe(
        take(1),
        switchMap( places => {
          if (!places || places.length <= 0) {
            return this.fetchPLaces();
          } else {
            return of(places);
          }
        }),
        switchMap( places => {
          const updatedPlacesIndex = places.findIndex( place => place.id == placeId);
          updatedPlaces = [...places];
          const oldPlace = updatedPlaces[updatedPlacesIndex];
          updatedPlaces[updatedPlacesIndex] = new Place(
            oldPlace.id,
            title,
            description,
            oldPlace.imageUrl,
            oldPlace.price,
            dateFrom,
            dateTo,
            oldPlace.userId
          );
           return this.http.put(`https://ionic-angular-jascha.firebaseio.com/offered-places/${placeId}.json`, 
           {...updatedPlaces[updatedPlacesIndex], id: null}
           );
        }),
        tap( () => {
          this._places.next(updatedPlaces);
        })
        );
    }
}

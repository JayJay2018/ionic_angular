import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take, map } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[]
  isLoading: boolean = false;
  private placesSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPLaces()
    .subscribe( () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  onFavoritePlace(placeId: string) {
    console.log('my fav spot' + placeId);
  }

  onFilterUpdate(event: any) {
    console.log(event);
    this.authService.userId.pipe(take(1))
    .subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } 
    })
  }

}

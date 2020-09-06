import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take, map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
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
    },
    errorRes => {
      let message = "Some bad error happend here..."
      console.error('error', errorRes);
      if (errorRes.error.error = 'Permission denied') {
        message = 'You are not authorised for this action.'
        this.showAlert(message);
      }
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

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Something unexpected happened...',
      message: message,
      buttons: [
        {
          text: 'Ok', 
          handler: () => {
            this.router.navigateByUrl('/auth');
          }
        }]
    })
    .then(loadingEl => {
      loadingEl.present();
    })
  }

}

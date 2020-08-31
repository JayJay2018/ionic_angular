import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
  loadedOffers: Place[];
  isLoading: boolean = false;
  constructor(
    private placesService: PlacesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.placesService.places.subscribe( places => {
      this.loadedOffers = places;
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPLaces().subscribe( () => {
      this.isLoading = false;
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();   
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
}

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  ICarouselConfig,
  AnimationConfig
} from './declarations';

@Injectable() // todo API
export class CarouselService {
  private imageLoadedCount = 0;

  private imageLoad = new Subject<string | string[]>();
  private config: ICarouselConfig;

  constructor() {}

  public init(imageSources: string[], config: ICarouselConfig = {
    verifyBeforeLoad: true,
    log: true,
    animation: true,
    animationType: AnimationConfig.SLIDE,
    autoplay: true,
    autoplayDelay: 3000
  }) {
    config.autoplayDelay = config.autoplayDelay < 1000 ? 1000 : config.autoplayDelay;

    this.config = config;

    if (config.verifyBeforeLoad) {
      this.imageLoad.next(imageSources);
      this.imageLoad.complete();
      return;
    }

    this.loadImages(imageSources);
  }

  public onImageLoad(): Observable<string | string[]> {
    return this.imageLoad.asObservable();
  }

  public getConfig(): ICarouselConfig {
    return Object.assign({}, this.config);
  }

  private loadImages(imageSources: string[]): void {
    const emitIfAllImagesLoaded = (): void => {
      if (this.imageLoadedCount === imageSources.length) {
        this.imageLoad.complete();
      }
    };

    imageSources.forEach(image => {
      const imgElement = document.createElement('img');
      imgElement.src = image;

      imgElement.onload = (e) => { // todo private func
        this.imageLoadedCount++;
        this.imageLoad.next(image);

        emitIfAllImagesLoaded();
      };

      imgElement.onerror = () => {
        imageSources.splice(imageSources.indexOf(image), 1);

        emitIfAllImagesLoaded();

        console.error(`Carousel module: image load error: ${image}`);
      };
    });
  }
}

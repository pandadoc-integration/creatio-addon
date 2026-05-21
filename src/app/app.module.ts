import { DoBootstrap, Injector, NgModule, ProviderToken } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { bootstrapCrtModule, CrtModule } from '@creatio-devkit/common';
import { PandaDocComponent } from './view-elements/pandadoc/pandadoc.component';

@CrtModule({
  viewElements: [PandaDocComponent],
})
@NgModule({
  declarations: [PandaDocComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
})
export class AppModule implements DoBootstrap {
  constructor(private _injector: Injector) {}

  ngDoBootstrap(): void {
    const pandadocElement = createCustomElement(PandaDocComponent, {
      injector: this._injector,
    });
    customElements.define('pdc-pandadoc', pandadocElement);

    bootstrapCrtModule('pandadoc', AppModule, {
      resolveDependency: (token) =>
        this._injector.get(<ProviderToken<unknown>>token),
    });
  }
}

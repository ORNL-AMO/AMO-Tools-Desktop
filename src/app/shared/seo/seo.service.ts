import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  /** Absolute canonical path, e.g. '/calculators/boiler' */
  canonicalPath: string;
  /** Comma-separated keywords. Ignored by Google but used by Bing/DuckDuckGo. */
  keywords?: string;
}

const BASE_URL = 'https://measur.ornl.gov';
const OG_IMAGE = `${BASE_URL}/assets/icons/png/256x256.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateMetadata(config: SeoConfig): void {
    // Avoid double-appending '| MEASUR' when the title already contains the brand name
    const fullTitle = config.title.includes('MEASUR')
      ? config.title
      : `${config.title} | MEASUR`;
    const canonicalUrl = `${BASE_URL}${config.canonicalPath}`;

    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({ name: 'description', content: config.description });

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    } else {
      this.metaService.removeTag('name="keywords"');
    }

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:image', content: OG_IMAGE });

    // Twitter
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });

    // Canonical link
    this.updateCanonicalUrl(canonicalUrl);
  }

  getCurrentTitle(): string {
    return this.titleService.getTitle();
  }

  setStructuredData(schema: object): void {
    const id = 'structured-data-ld-json';
    const existing = this.document.getElementById(id);
    if (existing) {
      existing.textContent = JSON.stringify(schema);
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  private updateCanonicalUrl(url: string): void {
    const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = url;
    } else {
      const link = this.document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      this.document.head.appendChild(link);
    }
  }
}

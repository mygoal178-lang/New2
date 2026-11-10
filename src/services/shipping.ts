/**
 * ORDERFLOW - Global Shipping & Logistics Adapter Architecture
 * Supports DHL, FedEx, UPS, USPS, Royal Mail, Australia Post, Aramex, and regional carriers.
 */

import { GlobalCourierProvider, CourierConfig } from '../types';

export interface CourierProviderMeta {
  provider: GlobalCourierProvider;
  name: string;
  countryScope: 'global' | 'domestic' | 'regional';
  logoBadge: string;
  trackingUrlTemplate: string;
  supportedServices: string[];
  requiresAccountNumber: boolean;
}

export const GLOBAL_COURIER_PROVIDERS: CourierProviderMeta[] = [
  {
    provider: 'dhl',
    name: 'DHL Express',
    countryScope: 'global',
    logoBadge: 'DHL',
    trackingUrlTemplate: 'https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id={TRACKING_ID}',
    supportedServices: ['Express Worldwide', 'Express 12:00', 'Economy Select'],
    requiresAccountNumber: true
  },
  {
    provider: 'fedex',
    name: 'FedEx Express & Ground',
    countryScope: 'global',
    logoBadge: 'FedEx',
    trackingUrlTemplate: 'https://www.fedex.com/fedextrack/?trknbr={TRACKING_ID}',
    supportedServices: ['International Priority', 'International Economy', 'Ground', 'Home Delivery'],
    requiresAccountNumber: true
  },
  {
    provider: 'ups',
    name: 'UPS Worldwide',
    countryScope: 'global',
    logoBadge: 'UPS',
    trackingUrlTemplate: 'https://www.ups.com/track?tracknum={TRACKING_ID}',
    supportedServices: ['Worldwide Express', 'Worldwide Saver', 'Standard', 'Ground'],
    requiresAccountNumber: true
  },
  {
    provider: 'usps',
    name: 'USPS (United States Postal Service)',
    countryScope: 'domestic',
    logoBadge: 'USPS',
    trackingUrlTemplate: 'https://tools.usps.com/go/TrackConfirmAction?tLabels={TRACKING_ID}',
    supportedServices: ['Priority Mail', 'Priority Mail Express', 'First-Class Package', 'Media Mail'],
    requiresAccountNumber: false
  },
  {
    provider: 'royal_mail',
    name: 'Royal Mail UK',
    countryScope: 'domestic',
    logoBadge: 'Royal Mail',
    trackingUrlTemplate: 'https://www.royalmail.com/track-your-item#/tracking-results/{TRACKING_ID}',
    supportedServices: ['Tracked 24', 'Tracked 48', 'Special Delivery Guaranteed', 'International Tracked'],
    requiresAccountNumber: true
  },
  {
    provider: 'canada_post',
    name: 'Canada Post',
    countryScope: 'domestic',
    logoBadge: 'Canada Post',
    trackingUrlTemplate: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor={TRACKING_ID}',
    supportedServices: ['Xpresspost', 'Regular Parcel', 'Expedited Parcel', 'Tracked Packet USA'],
    requiresAccountNumber: true
  },
  {
    provider: 'australia_post',
    name: 'Australia Post',
    countryScope: 'domestic',
    logoBadge: 'AusPost',
    trackingUrlTemplate: 'https://auspost.com.au/mypost/track/#/details/{TRACKING_ID}',
    supportedServices: ['Express Post', 'Parcel Post', 'International Express'],
    requiresAccountNumber: true
  },
  {
    provider: 'aramex',
    name: 'Aramex Logistics',
    countryScope: 'global',
    logoBadge: 'Aramex',
    trackingUrlTemplate: 'https://www.aramex.com/track/results?mode=0&ShipmentNumber={TRACKING_ID}',
    supportedServices: ['Value Express', 'Priority Document', 'Domestic Express'],
    requiresAccountNumber: true
  },
  {
    provider: 'pathao',
    name: 'Pathao Courier',
    countryScope: 'regional',
    logoBadge: 'Pathao',
    trackingUrlTemplate: 'https://merchant.pathao.com/tracking?consignment_id={TRACKING_ID}',
    supportedServices: ['Inside City Express', 'Outside City Delivery'],
    requiresAccountNumber: false
  },
  {
    provider: 'steadfast',
    name: 'Steadfast Courier',
    countryScope: 'regional',
    logoBadge: 'Steadfast',
    trackingUrlTemplate: 'https://steadfast.com.bd/tracking/{TRACKING_ID}',
    supportedServices: ['Next-day District Delivery', 'Sub-district Express'],
    requiresAccountNumber: false
  },
  {
    provider: 'custom_courier',
    name: 'Custom Courier / Local Fleet',
    countryScope: 'domestic',
    logoBadge: 'Fleet',
    trackingUrlTemplate: '',
    supportedServices: ['Same-day Local Dispatch', 'Own Delivery Fleet', 'Third-Party Messenger'],
    requiresAccountNumber: false
  }
];

export const GLOBAL_COURIERS = GLOBAL_COURIER_PROVIDERS;

export function getTrackingUrl(provider: GlobalCourierProvider, trackingId: string): string | undefined {
  const meta = GLOBAL_COURIER_PROVIDERS.find(p => p.provider === provider);
  if (!meta || !meta.trackingUrlTemplate) return undefined;
  return meta.trackingUrlTemplate.replace('{TRACKING_ID}', encodeURIComponent(trackingId));
}

export {};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMaps;
    };
  }
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow;
  services: {
    Places: new () => KakaoPlaces;
    Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };
  };
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoLatLngBounds {
  extend: (latlng: KakaoLatLng) => void;
}

interface KakaoMapOptions {
  center: KakaoLatLng;
  level?: number;
}

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  setLevel: (level: number) => void;
}

interface KakaoMarkerOptions {
  map: KakaoMap;
  position: KakaoLatLng;
  title?: string;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoInfoWindowOptions {
  content: string;
  removable?: boolean;
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
}

interface KakaoPlaceResult {
  id: string;
  place_name: string;
  x: string;
  y: string;
  address_name: string;
}

interface KakaoPlaces {
  keywordSearch: (
    keyword: string,
    callback: (result: KakaoPlaceResult[], status: string) => void
  ) => void;
}

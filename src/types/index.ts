export type LoadLevel = 'Seats Available' | 'Standing Available' | 'Limited Standing';
export type VehicleType = 'Double Decker' | 'Single Deck';

export interface BusArrivalInfo {
  etaMinutes: number; // 0 means 'Arr'
  load: LoadLevel;
  type: VehicleType;
  wab: boolean; // Wheelchair accessible
}

export interface BusService {
  serviceNo: string;
  operator: 'SBS Transit' | 'SMRT' | 'Tower Transit' | 'Go-Ahead SG';
  routeDescription: string;
  nextBus: BusArrivalInfo;
  subsequentBus: BusArrivalInfo;
  thirdBus: BusArrivalInfo;
  stopsCount: number;
}

export interface BusStop {
  code: string;
  name: string;
  road: string;
  latitude: number;
  longitude: number;
  services: BusService[];
}

export interface MeetupHotspot {
  id: string;
  name: string;
  area: string;
  landmark: string;
  nearestBusStopCode: string;
  nearestBusStopName: string;
  nearestMrt: string;
  description: string;
  coordinates: { lat: number; lng: number };
}

export interface CommuterTrip {
  personName: string;
  role: 'you' | 'friend';
  avatar: string;
  currentStopName: string;
  targetStopName: string;
  busServiceNo: string;
  operator: string;
  vehicleType: VehicleType;
  regNumber: string;
  deckPosition: string; // e.g. "Upper Deck, Front Row"
  etaMinutes: number;
  totalStops: number;
  stopsRemaining: number;
  speedKmH: number;
  status: 'on_schedule' | 'delayed' | 'arriving' | 'arrived';
  routeStops: {
    name: string;
    code: string;
    passed: boolean;
    isCurrent?: boolean;
    etaMinutes: number;
  }[];
}

export interface RescueSpot {
  id: string;
  name: string;
  category: 'cafe' | 'toast_kopi' | 'library' | 'mall_lounge' | 'bbt' | 'bar';
  hubId: string;
  locationDetails: string;
  walkingMinutes: number;
  distanceMeters: number;
  shelteredPercent: number; // e.g. 100% sheltered
  airConLevel: 'Super Cold ❄️❄️❄️' | 'Chilled ❄️❄️' | 'Breezy 🍃';
  crowdLevel: 'Low / Quiet' | 'Moderate' | 'Busy';
  hasPlugs: boolean;
  hasWifi: boolean;
  specialty: string;
  priceLevel: '$' | '$$' | '$$$';
  openHours: string;
  shelteredDirections: string;
}

export interface ReactionBubble {
  id: string;
  sender: string;
  text: string;
  emoji: string;
  timestamp: string;
  xOffset: number;
}

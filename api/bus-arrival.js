/**
 * LTA DataMall v3 Bus Arrival API Proxy
 * Path: /api/bus-arrival.js
 * Default GET endpoint: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Header: AccountKey: process.env.LTA_ACCOUNT_KEY
 * Query params: BusStopCode (required), ServiceNo (optional)
 * Refreshes every 20 seconds.
 */

// Helper to convert LTA Load code to human readable text
function formatLoad(loadCode) {
  switch (loadCode) {
    case 'SEA':
      return 'Seats Available';
    case 'SDA':
      return 'Standing Available';
    case 'LSD':
      return 'Limited Standing';
    default:
      return 'Seats Available';
  }
}

// Helper to convert LTA Vehicle Type
function formatType(typeCode) {
  switch (typeCode) {
    case 'DD':
      return 'Double Decker';
    case 'SD':
      return 'Single Deck';
    case 'BD':
      return 'Bendy Bus';
    default:
      return 'Single Deck';
  }
}

// Helper to convert LTA Operator code
function formatOperator(opCode) {
  switch (opCode) {
    case 'SBST':
      return 'SBS Transit';
    case 'SMRT':
      return 'SMRT';
    case 'TTS':
      return 'Tower Transit';
    case 'GAS':
      return 'Go-Ahead SG';
    default:
      return opCode || 'SBS Transit';
  }
}

// Calculate remaining minutes from EstimatedArrival ISO timestamp
function calculateEtaMinutes(isoDateString) {
  if (!isoDateString) return 0;
  const arrivalTime = new Date(isoDateString).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((arrivalTime - now) / 60000);
  return Math.max(0, diffMinutes);
}

// Fallback generator when LTA_ACCOUNT_KEY is not yet entered in Vercel
function getFallbackData(busStopCode, serviceNo) {
  const defaultServices = [
    { serviceNo: '65', op: 'SBST', nextMins: 2, subMins: 9, thirdMins: 18, type: 'DD', load: 'SDA', route: 'To HarbourFront Int' },
    { serviceNo: '190', op: 'SMRT', nextMins: 4, subMins: 12, thirdMins: 24, type: 'DD', load: 'LSD', route: 'To Kampong Bahru Ter' },
    { serviceNo: '147', op: 'SBST', nextMins: 6, subMins: 14, thirdMins: 25, type: 'DD', load: 'SEA', route: 'To Clementi Int' },
    { serviceNo: '175', op: 'SBST', nextMins: 11, subMins: 21, thirdMins: 32, type: 'SD', load: 'SEA', route: 'To Geylang Lor 1 Ter' },
    { serviceNo: '14', op: 'SBST', nextMins: 8, subMins: 17, thirdMins: 29, type: 'DD', load: 'SDA', route: 'To Clementi Int' },
    { serviceNo: '857', op: 'TTS', nextMins: 3, subMins: 11, thirdMins: 22, type: 'DD', load: 'SEA', route: 'To Suntec City (Loop)' },
    { serviceNo: '7', op: 'SBST', nextMins: 5, subMins: 13, thirdMins: 20, type: 'DD', load: 'SEA', route: 'To Bedok Int' },
  ];

  const filtered = serviceNo
    ? defaultServices.filter((s) => s.serviceNo === serviceNo)
    : defaultServices;

  const now = new Date();
  const nowTime = now.getTime();

  const services = (filtered.length > 0 ? filtered : defaultServices.slice(0, 4)).map((s) => {
    return {
      serviceNo: s.serviceNo,
      operator: formatOperator(s.op),
      routeDescription: s.route,
      nextBus: {
        etaMinutes: s.nextMins,
        load: formatLoad(s.load),
        type: formatType(s.type),
        wab: true,
        estimatedArrival: new Date(nowTime + s.nextMins * 60000).toISOString(),
      },
      subsequentBus: {
        etaMinutes: s.subMins,
        load: 'Seats Available',
        type: formatType(s.type),
        wab: true,
        estimatedArrival: new Date(nowTime + s.subMins * 60000).toISOString(),
      },
      thirdBus: {
        etaMinutes: s.thirdMins,
        load: 'Seats Available',
        type: 'Single Deck',
        wab: true,
        estimatedArrival: new Date(nowTime + s.thirdMins * 60000).toISOString(),
      },
      stopsCount: 35,
    };
  });

  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: busStopCode,
    source: 'fallback_offline',
    message: 'Add LTA_ACCOUNT_KEY in Vercel environment variables to stream live LTA DataMall v3 data.',
    timestamp: new Date().toISOString(),
    Services: services,
  };
}

export default async function handler(req, res) {
  // Extract query parameters
  const query = req.query || {};
  const busStopCode = (query.BusStopCode || query.busStopCode || '04121').toString().trim();
  const serviceNo = (query.ServiceNo || query.serviceNo || '').toString().trim();

  const ltaKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env['LTA _ACCOUNT_KEY'] ||
    '';

  // If no AccountKey provided in environment, return formatted fallback data
  if (!ltaKey || ltaKey === 'MY_LTA_KEY') {
    return res.status(200).json(getFallbackData(busStopCode, serviceNo));
  }

  // Prepare LTA Datamall v3 URL
  let ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(
    busStopCode
  )}`;
  if (serviceNo) {
    ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(ltaUrl, {
      method: 'GET',
      headers: {
        AccountKey: ltaKey,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`LTA API error ${response.status}: ${response.statusText}`);
      const fallback = getFallbackData(busStopCode, serviceNo);
      fallback.source = 'fallback_lta_error';
      fallback.ltaStatusCode = response.status;
      return res.status(200).json(fallback);
    }

    const data = await response.json();
    const rawServices = data.Services || [];

    // Format raw LTA services into CatchUp SG structured format
    const formattedServices = rawServices.map((svc) => {
      const nextBus = svc.NextBus || {};
      const nextBus2 = svc.NextBus2 || {};
      const nextBus3 = svc.NextBus3 || {};

      return {
        serviceNo: svc.ServiceNo,
        operator: formatOperator(svc.Operator),
        routeDescription: `Service ${svc.ServiceNo}`,
        nextBus: {
          etaMinutes: calculateEtaMinutes(nextBus.EstimatedArrival),
          load: formatLoad(nextBus.Load),
          type: formatType(nextBus.Type),
          wab: nextBus.Feature === 'WAB',
          estimatedArrival: nextBus.EstimatedArrival,
          latitude: nextBus.Latitude,
          longitude: nextBus.Longitude,
        },
        subsequentBus: {
          etaMinutes: calculateEtaMinutes(nextBus2.EstimatedArrival),
          load: formatLoad(nextBus2.Load),
          type: formatType(nextBus2.Type),
          wab: nextBus2.Feature === 'WAB',
          estimatedArrival: nextBus2.EstimatedArrival,
        },
        thirdBus: {
          etaMinutes: calculateEtaMinutes(nextBus3.EstimatedArrival),
          load: formatLoad(nextBus3.Load),
          type: formatType(nextBus3.Type),
          wab: nextBus3.Feature === 'WAB',
          estimatedArrival: nextBus3.EstimatedArrival,
        },
        raw: svc,
      };
    });

    return res.status(200).json({
      'odata.metadata': data['odata.metadata'],
      BusStopCode: data.BusStopCode || busStopCode,
      source: 'lta_datamall',
      timestamp: new Date().toISOString(),
      rawServices: rawServices,
      Services: formattedServices,
    });
  } catch (error) {
    console.error('Error fetching LTA Datamall bus arrival:', error);
    const fallback = getFallbackData(busStopCode, serviceNo);
    fallback.source = 'fallback_network_exception';
    fallback.error = error.message;
    return res.status(200).json(fallback);
  }
}

export type Language = "en" | "hi";

export const translations = {
  en: {
    // Brand & Top Header
    appName: "FarmLink Direct",
    tagline: "B2B Fresh Produce Infrastructure",
    lucknowCluster: "Whole Lucknow Regional Agri-Cluster Active",
    clusterTicker: "Active Lucknow Zones: Bakshi Ka Talab • Malihabad • Kakori • Dubagga • Chinhat • Gosainganj • Mohanlalganj • Sitapur Road • Hazratganj • Gomti Nagar",
    b2bDirectSubtitle: "B2B Direct Produce Infrastructure",
    switchLanguage: "भाषा बदलें (Hindi)",
    signIn: "Sign In",
    register: "Register",
    logOut: "Log Out",
    welcome: "Welcome",

    // Navigation Links
    navMarketplace: "Produce Marketplace",
    navFarmer: "Farmer Portal",
    navFPO: "FPO Aggregator Hub",
    navDriver: "Fleet Dispatch",
    navOps: "Control Tower",
    navBrowseMarket: "Browse Market",
    navBulkDemand: "Bulk Market Demand",

    // Hero Section
    heroBadge: "Lucknow Regional Agri-Cluster Production Platform",
    heroTitleLine1: "Fair Markets.",
    heroTitleLine2: "Verifiable Fulfillment.",
    heroSubtitle: "Connecting smallholder farmers, cooperative FPOs, logistics drivers, and institutional buyers across all Lucknow tehsils with deterministic price intelligence, real GPS geolocation, and turn-by-turn Google Maps routing.",
    directPortalsLabel: "Direct Portals:",
    sellYourProduce: "Sell Your Produce",
    browseMarketplace: "Browse Live Marketplace",

    // Explore 5 Operational Dashboards
    dashboardShowcaseTag: "Customized Operations",
    dashboardShowcaseTitle: "Explore All 5 Operational Dashboards",
    dashboardShowcaseSubtitle: "Every agricultural stakeholder has a purpose-built workspace engineered for their daily workflow.",

    // Portal Card Titles & Descriptions
    fpoTitle: "FPO Aggregator Hub",
    fpoRole: "Cooperative Aggregator",
    fpoDesc: "Pool smallholder harvests into high-tonnage commercial lots, manage member farmer registries, collection center intakes, and transparent 3% cooperative payout ledgers.",
    fpoBadge: "Dedicated Aggregator Portal",

    opsTitle: "Operations Control Tower",
    opsRole: "Ops Coordinator Command",
    opsDesc: "Real-time Lucknow fleet corridor telemetry, automated OR-Tools route solver, APMC Mandi price ingestion monitor, quality dispute resolution, and settlement clearing.",
    opsBadge: "Real-Time Telemetry & Solvers",

    driverTitle: "Driver Turn-by-Turn Dispatch",
    driverRole: "Logistics Fleet Portal",
    driverDesc: "Sequential pickup-to-dock route manifests, 1-tap Google Maps turn-by-turn driving navigation deep-links, direct tap-to-call, and OTP proof-of-delivery verification.",
    driverBadge: "1-Tap Google Maps Navigation",

    farmerTitle: "Farmer Discovery Portal",
    farmerRole: "Kisan Direct Producer",
    farmerDesc: "List harvest batches with AI voice assistant, capture real GPS farm coordinates (Bakshi Ka Talab, Malihabad), receive fair mandi price guidance, and track bank payouts.",
    farmerBadge: "GPS Geolocation & Voice AI",

    buyerTitle: "Institutional Marketplace",
    buyerRole: "Commercial Buyer Hub",
    buyerDesc: "Direct procurement of 10 regional fresh produce commodities across Lucknow, live driver transit tracking, Google Maps route view, and secure OTP receipt confirmation.",
    buyerBadge: "10 Regional Commodities",

    openPortal: "Open",

    // Technical Pillars
    techTitle: "Engineered for real-world agricultural logistics.",
    techSubtitle: "Bridging farm gate collection with urban commercial receiving docks.",
    featureGmapsTitle: "Google Maps Navigation",
    featureGmapsDesc: "Direct 1-tap deep links opening native Google Maps turn-by-turn driving directions from farm gate to buyer docks.",
    featureGpsTitle: "GPS Farm Geolocation",
    featureGpsDesc: "Instant browser GPS pin detection ensuring farm gate pickup coordinates are accurately mapped across Lucknow tehsils.",
    featurePoolingTitle: "FPO Bulk Pooling",
    featurePoolingDesc: "Cooperative lot aggregation pooling smallholder yields into high-tonnage truckloads to maximize farmer earnings.",
    featureSettlementsTitle: "Transparent Settlements",
    featureSettlementsDesc: "Automated 93% net farmer payout, 5% logistics fee, and 2% platform reconciliation cleared instantly on OTP delivery.",

    // Farmer Portal Features
    listProduceTab: "List Produce (उपज लिस्ट करें)",
    myLotsTab: "My Lots (मेरी उपज)",
    orderCommitmentsTab: "Orders (खरीद आर्डर)",
    farmsTab: "My Farms & GPS (खेत और स्थान)",
    voiceAssistantPrompt: "Tap mic to speak details in Hindi or English",
    useCurrentGps: "📍 Use Current GPS",
    gpsAcquired: "GPS captured successfully",
    quickSelectVillage: "Quick Select Lucknow Agricultural Hub / गाँव चुनें:",
    farmGateCoordinates: "Farm Geo-Coordinates",
    verifyOnGoogleMaps: "Verify on Google Maps →",
    publishToMarketplace: "Publish Lot to Live Marketplace",

    // FPO Hub Features
    aggregationHubTab: "Aggregation Hub",
    poolBulkLotTab: "Pool Bulk Lot",
    memberFarmersTab: "Member Farmers",
    collectionIntakeTab: "Collection Intake",
    memberPayoutsTab: "Member Payouts",
    activeMembersCount: "Active Members",
    pooledVolumeQuintals: "Pooled Volume",
    grossSalesTrade: "Gross Sales",
    fpoSurplusFund: "FPO Surplus Fund (3%)",
    addMemberFarmer: "Add Member Farmer",
    directBankTransfer: "Direct Bank Transfer",

    // Driver Features
    navigateInGoogleMaps: "Navigate in Google Maps",
    farmGatePickup: "1. Farm Gate Pickup Location",
    buyerDestination: "2. Buyer Drop-Off Destination",
    confirmPickedUp: "Confirm Produce Picked Up",
    loadedOnVehicle: "Loaded on Tata Ace",
    verifyDeliveryOtp: "Verify Delivery OTP",
    deliveredAndVerified: "Delivered & Verified",
    tapToCall: "Tap to Call",

    // Buyer Features
    searchRadiusKm: "Search Radius (Lucknow Cluster)",
    filterAllProduce: "All Regional Produce",
    totalOrderCommitment: "Total Order Commitment",
    confirmPlaceOrder: "Confirm & Place Order",
    deliveryOtpLabel: "Delivery OTP Code:",
    trackRouteGoogleMaps: "Google Maps Route →",

    // Ops Features
    activeDispatches: "Active Dispatches",
    movingVolumeTons: "Moving Volume",
    networkGmv: "Network GMV",
    fulfillmentSla: "Fulfillment SLA",
    recalculateRoutes: "Re-Calculate Optimized Routes",
    mandiModalRate: "APMC Mandi Modal Rate",
    farmlinkDirectRate: "FarmLink Direct Rate",
    farmerRealization: "Farmer Net Realization",
    clearPayout: "Clear & Approve Payout",

    // Commodities (10 Crops)
    tomato: "Tomato (टमाटर)",
    onion: "Onion (प्याज)",
    potato: "Potato (आलू)",
    mango: "Dussehri Mango (दशहरी आम)",
    chilli: "Green Chilli (हरी मिर्च)",
    garlic: "Garlic (लहसुन)",
    ginger: "Ginger (अदरक)",
    spinach: "Spinach (पालक)",
    cauliflower: "Cauliflower (फूलगोभी)",
    wheat: "Wheat (गेहूं)",
  },

  hi: {
    // Brand & Top Header
    appName: "फार्मलिंक डायरेक्ट (FarmLink Direct)",
    tagline: "कृषि उपज सीधा बाज़ार एवं लॉजिस्टिक्स",
    lucknowCluster: "संपूर्ण लखनऊ क्षेत्रीय कृषि क्लस्टर सक्रिय",
    clusterTicker: "सक्रिय लखनऊ क्षेत्र: बक्शी का तालाब • मलिहाबाद • काकोरी • दुबग्गा मंडी • चिनहट • गोसाईंगंज • मोहनलालगंज • सीतापुर रोड • हज़रतगंज • गोमती नगर",
    b2bDirectSubtitle: "थोक कृषि उपज सीधी खरीद-बिक्री",
    switchLanguage: "Switch to English",
    signIn: "लॉग इन करें",
    register: "पंजीकरण करें",
    logOut: "लॉग आउट",
    welcome: "स्वागत है",

    // Navigation Links
    navMarketplace: "उपज मंडी बाज़ार",
    navFarmer: "किसान पोर्टल",
    navFPO: "एफपीओ (FPO) हब",
    navDriver: "वाहन डिस्पेच",
    navOps: "कंट्रोल टॉवर",
    navBrowseMarket: "मंडी मांग देखें",
    navBulkDemand: "थोक मांग देखें",

    // Hero Section
    heroBadge: "लखनऊ क्षेत्रीय कृषि क्लस्टर डायरेक्ट प्लेटफॉर्म",
    heroTitleLine1: "उचित मूल्य।",
    heroTitleLine2: "विश्वसनीय डिलीवरी।",
    heroSubtitle: "लखनऊ की सभी तहसीलों के किसान, एफपीओ, वाहन चालक और बड़े खरीदारों को जोड़ने वाला डिजिटल प्लेटफॉर्म — सही मंडी भाव, रियल GPS लोकेशन और गूगल मैप्स नेविगेशन के साथ।",
    directPortalsLabel: "सीधे पोर्टल:",
    sellYourProduce: "अपनी फसल बेचें",
    browseMarketplace: "लाइव मंडी बाज़ार देखें",

    // Explore 5 Operational Dashboards
    dashboardShowcaseTag: "विशिष्ट कार्यप्रणाली",
    dashboardShowcaseTitle: "सभी 5 ऑपरेशनल डैशबोर्ड देखें",
    dashboardShowcaseSubtitle: "हर स्टेकहोल्डर के लिए उनकी दैनिक आवश्यकताओं के अनुसार तैयार किया गया समर्पित पोर्टल।",

    // Portal Card Titles & Descriptions
    fpoTitle: "एफपीओ (FPO) एग्रीगेटर हब",
    fpoRole: "सहकारी समिति / एग्रीगेटर",
    fpoDesc: "छोटे किसानों की फसल को बड़े कमर्शियल लॉट में बदलना, किसान सदस्यों का प्रबंधन, कलेक्शन सेंटर स्टोरेज और पारदर्शी 3% कमीशन लेजर।",
    fpoBadge: "समर्पित एफपीओ पोर्टल",

    opsTitle: "ऑपरेशंस कंट्रोल टॉवर",
    opsRole: "ऑपरेशंस कोऑर्डिनेटर कमांड",
    opsDesc: "लखनऊ क्लस्टर की रियल-टाइम वाहन ट्रैकिंग, OR-Tools ऑप्टिमाइज़्ड रूट सॉल्वर, APMC मंडी भाव मॉनिटर और त्वरित बैंक भुगतान स्वीकृति।",
    opsBadge: "रियल-टाइम टेलीमेट्री व सॉल्वर",

    driverTitle: "ड्राइवर जीपीएस डिस्पेच",
    driverRole: "लॉजिस्टिक्स फ्लीट पोर्टल",
    driverDesc: "क्रमवार पिकअप और डिलीवरी लिस्ट, 1-क्लिक गूगल मैप्स टर्न-बाय-टर्न ड्राइविंग नेविगेशन, डायरेक्ट कॉलिंग और OTP डिलीवरी सत्यापन।",
    driverBadge: "1-क्लिक गूगल मैप्स नेविगेशन",

    farmerTitle: "किसान डिस्कवरी पोर्टल",
    farmerRole: "किसान / सीधा उत्पादक",
    farmerDesc: "आवाज से बोलकर फसल लिस्ट करें (AI वॉयस), खेत की सही GPS लोकेशन दर्ज करें, मंडी भाव का पूर्वानुमान देखें और खाते में सीधा भुगतान पाएं।",
    farmerBadge: "GPS लोकेशन और वॉयस AI",

    buyerTitle: "संस्थागत थोक बाज़ार",
    buyerRole: "व्यापारी / खरीदार हब",
    buyerDesc: "लखनऊ भर से 10 प्रमुख ताज़ा फसलों की सीधी थोक खरीद, लाइव वाहन ट्रैकिंग, गूगल मैप्स रूट और सुरक्षित 4-अंकीय OTP डिलीवरी।",
    buyerBadge: "10 प्रमुख क्षेत्रीय फसलें",

    openPortal: "खोलें",

    // Technical Pillars
    techTitle: "वास्तविक कृषि लॉजिस्टिक्स के लिए आधुनिक तकनीक।",
    techSubtitle: "खेत की मेड़ से लेकर शहरों के गोदामों तक पारदर्शी आपूर्ति श्रृंखला।",
    featureGmapsTitle: "गूगल मैप्स नेविगेशन",
    featureGmapsDesc: "खेत से खरीदार के गोदाम तक टर्न-बाय-टर्न ड्राइविंग दिशा-निर्देशों के लिए 1-क्लिक डायरेक्ट लिंक।",
    featureGpsTitle: "खेत की GPS लोकेशन",
    featureGpsDesc: "ब्राउज़र से खेत की सटीक अक्षांश-देशांतर लोकेशन पिन करें ताकि वाहन सीधे खेत के गेट तक पहुंच सके।",
    featurePoolingTitle: "FPO थोक एग्रीगेशन",
    featurePoolingDesc: "छोटे किसानों की उपज को बड़े ट्रकलोड में इकट्ठा करके थोक खरीदारों से अधिक भाव प्राप्त करें।",
    featureSettlementsTitle: "पारदर्शी बैंक भुगतान",
    featureSettlementsDesc: "93% सीधा किसान भुगतान, 5% वाहन भाड़ा और 2% प्लेटफॉर्म शुल्क — डिलीवरी होते ही तुरंत बैंक ट्रांसफर।",

    // Farmer Portal Features
    listProduceTab: "उपज लिस्ट करें",
    myLotsTab: "मेरी सक्रिय उपज (Lots)",
    orderCommitmentsTab: "खरीद आर्डर",
    farmsTab: "खेत और GPS लोकेशन",
    voiceAssistantPrompt: "माइक दबाकर हिंदी या इंग्लिश में बोलें",
    useCurrentGps: "📍 वर्तमान GPS लोकेशन लें",
    gpsAcquired: "GPS लोकेशन सफलतापूर्वक दर्ज की गई",
    quickSelectVillage: "लखनऊ का प्रमुख कृषि क्षेत्र / गाँव चुनें:",
    farmGateCoordinates: "खेत की GPS लोकेशन (Coordinates)",
    verifyOnGoogleMaps: "गूगल मैप्स पर देखें →",
    publishToMarketplace: "फसल बाज़ार में लिस्ट करें",

    // FPO Hub Features
    aggregationHubTab: "एग्रीगेशन हब",
    poolBulkLotTab: "थोक लॉट बनाएं",
    memberFarmersTab: "सदस्य किसान",
    collectionIntakeTab: "कलेक्शन सेंटर स्टॉक",
    memberPayoutsTab: "किसान बैंक भुगतान",
    activeMembersCount: "सक्रिय किसान सदस्य",
    pooledVolumeQuintals: "एकत्रित फसल (कुंतल)",
    grossSalesTrade: "कुल थोक बिक्री",
    fpoSurplusFund: "FPO संचालन फंड (3%)",
    addMemberFarmer: "नया सदस्य किसान जोड़ें",
    directBankTransfer: "सीधा बैंक ट्रांसफर",

    // Driver Features
    navigateInGoogleMaps: "गूगल मैप्स से नेविगेट करें",
    farmGatePickup: "1. खेत से पिकअप स्थान",
    buyerDestination: "2. खरीदार का डिलीवरी गोदाम",
    confirmPickedUp: "फसल पिकअप की पुष्टि करें",
    loadedOnVehicle: "टाटा ऐस वाहन पर लोड हुआ",
    verifyDeliveryOtp: "डिलीवरी OTP सत्यापित करें",
    deliveredAndVerified: "सफलतापूर्वक डिलीवर व सत्यापित",
    tapToCall: "कॉल करने के लिए टैप करें",

    // Buyer Features
    searchRadiusKm: "खोज का दायरा (लखनऊ क्लस्टर)",
    filterAllProduce: "सभी क्षेत्रीय फसलें",
    totalOrderCommitment: "कुल आर्डर मूल्य",
    confirmPlaceOrder: "आर्डर बुक करें",
    deliveryOtpLabel: "डिलीवरी OTP कोड:",
    trackRouteGoogleMaps: "गूगल मैप्स रूट देखें →",

    // Ops Features
    activeDispatches: "सक्रिय डिलीवरी वाहन",
    movingVolumeTons: "सड़क पर कुल माल (टन)",
    networkGmv: "नेटवर्क कुल व्यापार (GMV)",
    fulfillmentSla: "संतुष्टि दर (SLA)",
    recalculateRoutes: "रूट ऑप्टिमाइज़र चलाएं",
    mandiModalRate: "APMC मंडी मॉडल भाव",
    farmlinkDirectRate: "फार्मलिंक डायरेक्ट भाव",
    farmerRealization: "किसान को अधिक लाभ",
    clearPayout: "बैंक भुगतान स्वीकृत करें",

    // Commodities (10 Crops)
    tomato: "टमाटर (Tomato)",
    onion: "प्याज (Onion)",
    potato: "आलू (Potato)",
    mango: "मलिहाबादी दशहरी आम (Mango)",
    chilli: "हरी मिर्च (Green Chilli)",
    garlic: "लहसुन (Garlic)",
    ginger: "अदरक (Ginger)",
    spinach: "पालक (Spinach)",
    cauliflower: "फूलगोभी (Cauliflower)",
    wheat: "गेहूं (Wheat)",
  },
};

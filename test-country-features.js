// Test script for country-specific features
// This script tests the Services and Community components for both France and Germany

console.log('🧪 Testing Country-Specific Features...\n');

// Test data for Germany
const germanyServices = {
    government: [
        "Ausländerbehörde (Foreigners' Office)",
        "Jobcenter / Agentur für Arbeit",
        "Krankenkasse (Health Insurance)",
        "Finanzamt (Tax Office)",
        "Rathaus (City Hall)"
    ],
    local: [
        "Public Transport (Deutsche Bahn)",
        "Waste Management / Recycling",
        "Electricity, Gas & Water Suppliers",
        "Banks"
    ],
    banks: [
        "Deutsche Bank",
        "Commerzbank",
        "Sparkasse"
    ]
};

const germanyCommunities = [
    "Tafel Deutschland",
    "Foodsharing Deutschland",
    "Caritas Deutschland",
    "Deutsches Rotes Kreuz",
    "AWO (Arbeiterwohlfahrt)"
];

// Test data for France
const franceServices = {
    government: [
        "Préfecture / Sous-Préfecture",
        "CAF (Caisse d'Allocations Familiales)",
        "CPAM (Caisse Primaire d'Assurance Maladie)",
        "Pôle Emploi",
        "URSSAF"
    ],
    local: [
        "Public Transport Authority (RATP)",
        "Waste Management / Recycling Centers",
        "City Hall (Mairie)",
        "Electricity, Gas & Water Suppliers",
        "Banks"
    ],
    banks: [
        "BNP Paribas",
        "Société Générale",
        "La Banque Postale"
    ]
};

const franceCommunities = [
    "Restos du Cœur",
    "AMAP Ile-de-France",
    "Secours Populaire",
    "Croix-Rouge Française",
    "Cop1.fr"
];

// Test emergency numbers
const emergencyNumbers = {
    Germany: "Police: 110, Medical: 112, Fire: 112",
    France: "Police: 17, Medical: 15, Fire: 18"
};

// Test government links
const governmentLinks = {
    Germany: "service-bw.de",
    France: "service-public.fr"
};

console.log('✅ Test Data Prepared:');
console.log(`   - Germany Services: ${germanyServices.government.length + germanyServices.local.length} total`);
console.log(`   - Germany Communities: ${germanyCommunities.length}`);
console.log(`   - France Services: ${franceServices.government.length + franceServices.local.length} total`);
console.log(`   - France Communities: ${franceCommunities.length}\n`);

console.log('🔗 Test URLs:');
console.log(`   - Backend Health: https://expat-ease.onrender.com/health`);
console.log(`   - Frontend: http://localhost:5173`);
console.log(`   - API Docs: https://expat-ease.onrender.com/docs\n`);

console.log('🧪 Test Scenarios:');
console.log('   1. Register new user with Germany settlement country');
console.log('   2. Check Services component shows German content');
console.log('   3. Check Community component shows German organizations');
console.log('   4. Verify emergency numbers show German numbers');
console.log('   5. Verify government links point to German services');
console.log('   6. Test with France settlement country for comparison\n');

console.log('📋 Manual Test Checklist:');
console.log('   □ Open http://localhost:5173');
console.log('   □ Register new account');
console.log('   □ Select "Germany" as settlement country');
console.log('   □ Navigate to Services tab');
console.log('   □ Verify German government services are shown');
console.log('   □ Verify German local services are shown');
console.log('   □ Verify German banks are shown');
console.log('   □ Navigate to Community tab');
console.log('   □ Verify German organizations are shown');
console.log('   □ Check emergency numbers show German numbers');
console.log('   □ Check government services link points to German site');
console.log('   □ Test with France for comparison\n');

console.log('🚀 Ready for testing! Frontend should be running at http://localhost:5173');

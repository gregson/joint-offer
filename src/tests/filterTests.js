const { filterPlans } = require('../utils/dataLoader');

// Test des filtres
console.log('=== Tests des filtres de forfaits ===\n');

// Test du filtre de prix
console.log('1. Test du filtre de prix (20-30€):');
const priceFilteredPlans = filterPlans({ priceRange: [20, 30] });
console.log(`Nombre de forfaits trouvés: ${priceFilteredPlans.length}`);
priceFilteredPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.price}€)`);
});

// Test du filtre de data
console.log('\n2. Test du filtre de data (>= 100Go):');
const dataFilteredPlans = filterPlans({ data: 100 });
console.log(`Nombre de forfaits trouvés: ${dataFilteredPlans.length}`);
dataFilteredPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.data})`);
});

// Test des forfaits illimités
console.log('\n3. Test du filtre des forfaits data illimités:');
const unlimitedDataPlans = filterPlans({ data: -1 });
console.log(`Nombre de forfaits trouvés: ${unlimitedDataPlans.length}`);
unlimitedDataPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.data})`);
});

// Test du filtre réseau 5G
console.log('\n4. Test du filtre réseau 5G:');
const network5GPlans = filterPlans({ network: '5G' });
console.log(`Nombre de forfaits trouvés: ${network5GPlans.length}`);
network5GPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.networkType.join(', ')})`);
});

// Test combiné
console.log('\n5. Test combiné (prix: 20-40€, data >= 100Go, 5G):');
const combinedFilterPlans = filterPlans({
    priceRange: [20, 40],
    data: 100,
    network: '5G'
});
console.log(`Nombre de forfaits trouvés: ${combinedFilterPlans.length}`);
combinedFilterPlans.forEach(plan => {
    console.log(`- ${plan.name} (${plan.price}€, ${plan.data}, ${plan.networkType.join(', ')})`);
});

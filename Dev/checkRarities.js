const CardBuilder = require('../Helpers/CardBuilder');
const stats = {
    "Common": { holo: 0, star: 0, gold: 0, normal: 0, count: 0},
    "Uncommon": { holo: 0, star: 0, gold: 0, normal: 0, count: 0},
    "Rare": { holo: 0, star: 0, gold: 0, normal: 0, count: 0},
    "Legendary": { holo: 0, star: 0, gold: 0, normal: 0, count: 0},
    "Mythical": { holo: 0, star: 0, gold: 0, normal: 0, count: 0},
}

for (let i = 0; i < 100000000; i++ ) {
    const pack = CardBuilder.openPack();
    for ( const card of pack ) {
        if ( card.details.holo ) { stats[card.rarity].holo++; }
        if ( card.details.gold ) { stats[card.rarity].gold++; }
        else if ( card.details.star ) { stats[card.rarity].star++; }
        if ( !card.details.gold && !card.details.star ) {
            stats[card.rarity].normal++;
        }
        stats[card.rarity].count++;
    }
}

for ( const [rarity, details] of Object.entries(stats) ) {
    console.log(`${rarity} Holo %${(details.holo/details.count)*100}`);
    console.log(`${rarity} Gold %${(details.gold/details.count)*100}`);
    console.log(`${rarity} Star %${(details.star/details.count)*100}`);
    console.log(`${rarity} Normal %${(details.normal/details.count)*100}`);
    console.log("\n");
}
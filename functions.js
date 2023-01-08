require('dotenv').config();
const BHKEY = process.env.BH_KEY;
const axios = require('axios');
// courtesty of https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
// sort object and return same object type
function sort_object(obj) {
    items = Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    sorted_obj = {};
    items.forEach(function(v) {
        use_key = v[0];
        use_value = v[1];
        sorted_obj[use_key] = use_value;
    });
    return (sorted_obj);
}

// obtain id from url player search request url
// https://api.brawlhalla.com/player/id/ranked?api_key=BHKEY
// would return just 'id'
function idFromUrl(url) {
    let id = url.replace('https://api.brawlhalla.com/player/', '');
    id = id.replace (`/ranked?api_key=${BHKEY}`, '');
    return id;
}

// https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
}

// sleep function to use to limit requests from api
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// return "dictionary" of all FUGACI member's (keys) elos (values) sorted from highest to lowest elo
// members who have not played ranked yet this season have a value of -1
// https://www.youtube.com/watch?v=xWRp1K8ga9s helped me out so much with this function
let prevResult = {};
async function getClanElo(id) {
    try {
        let errorFlag = false;
        let clan;
        const clanID = id;
        const req = 'https://api.brawlhalla.com/clan/' + clanID + '/?api_key=' + BHKEY;
        const members = {};
        const memberElo = {};
        // this is where the yt video helped me
        await axios.get(req, {timeout: 30000})
        .then(result => {
            clan = result.data.clan;
        })
        .catch(error => {
            // console.log(error);
            errorFlag = true;
            console.log('\x1b[31m', 'ERR: Probably API Rate Limit Reached');
        });
        if (errorFlag) {
            if (prevResult[id] != null) {
                console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                return prevResult[id];
            }
            else {
                console.log('\x1b[33m', 'WARNING: No recent data was found/returned');
                return null;
            }
        }
        // create dictionary of all member brawlhalla ids as keys and names as values
        for (let i = 0; i < clan.length; i++) {
            const member = JSON.stringify(clan[i]);
            members[JSON.parse(member).brawlhalla_id] = JSON.parse(member).name;
        }
        // temporarily hardcode console/mobile players
        if (id == '682808') {
            members['45923794'] = 'Jaboogle5274';
            members['20661966'] = 'KrY Optics';
            members['29471488'] = 'DarkIngram678';
            members['17438506'] = 'Ghheko';
            members['51183832'] = 'Majiama';
            members['47021368'] = 'Mokoffee(Mobile Acc)';
        }

        // create dictionary of member's names as keys and their current peak elo as values
        // yt vid helped here too
        let failedIds = [];
        let urls = [];
        for (const id in members) {
            let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
            urls.push(url);
        }

        // determine number of batches to separate requests into to stay under api limit
        const batchSize = 10;
        let batchCount = 0;
        if (urls.length % batchSize == 0) {
            batchCount = urls.length / batchSize;
        }
        else {
            batchCount = Math.floor(urls.length / batchSize) + 1;
        }

        // obtain elo of each member in clan
        let start = 0;
        let end = batchSize;
        let batch = [];

        for (let i = 0; i < batchCount; i++) {
            await sleep(1200).then(async () => {
                batch = urls.slice(start, end);
                console.log(batch);
                await Promise.all(batch.map((url) => {
                    let id = idFromUrl(url);
                    return axios.get(url, {timeout: 30000})
                    .then(result => {
                        // console.log(`got data for ${members[id]}`);
                        const peakElo = result.data.peak_rating;
                        if (peakElo != undefined) {
                            memberElo[members[id]] = peakElo;
                        }
                        else {
                            memberElo[members[id]] = -1;
                        }
                    })
                    .catch(error => {
                        // console.log(error);
                        failedIds.push(id);
                        // console.log(`Error getting data for: ${id} (probably timeout error)`);
                    });
                }));

                start += batchSize;
                end += batchSize;
            });
        }
        console.log(`Failed ids: ${failedIds}`);
        // rerun through failed ids
        let furls = [];
        if (failedIds != 0) {
            // create array for failed urls
            for (let i = 0; i < failedIds.length; i++) {
                let id = failedIds[i];
                let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
                furls.push(url);
            }
            failedIds = [];

            // determine number of batches to separate requests into to stay under api limit
            // made it a safer batch size and delay for the reran requests
            const fBatchSize = 5;
            let fBatchCount = 0;
            if (furls.length % fBatchSize == 0) {
                fBatchCount = furls.length / fBatchSize;
            }
            else {
                fBatchCount = Math.floor(furls.length / fBatchSize) + 1;
            }

            // obtain elo of for failed request members
            start = 0;
            end = fBatchSize;
            batch = [];
            for (let i = 0; i < fBatchCount; i++) {
                await sleep(2000).then(async () => {
                    batch = furls.slice(start, end);
                    console.log(batch);
                    await Promise.all(batch.map((url) => {
                        let id = idFromUrl(url);
                        return axios.get(url, {timeout: 30000})
                        .then(result => {
                            // console.log(`got data for ${members[id]}`);
                            const peakElo = result.data.peak_rating;
                            if (peakElo != undefined) {
                                memberElo[members[id]] = peakElo;
                            }
                            else {
                                memberElo[members[id]] = -1;
                            }
                        })
                        .catch(error => {
                            // console.log(error);
                            failedIds.push(id);
                            // console.log(`Error getting data for: ${id} (probably timeout error)`);
                        });
                    }));

                    start += fBatchSize;
                    end += fBatchSize;
                });
            }
        }
        let sortedMemberElo = sort_object(memberElo);

        // check for ids with errors
        if (failedIds.length != 0) {
            for (let i = 0; i < failedIds.length; i++) {
                console.log('\x1b[31m', `ERR: Obtaining data for ${failedIds[i]}`);
                if (prevResult[id] != null) {
                    console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                    return prevResult[id];
                }
                else {
                    return null;
                }
            }
        } else if (furls.length != 0) {
            console.log('\x1b[32m', 'SUCCESS: But had to do another request with');
            for (let i = 0; i < furls.length; i++) {
                console.log('\x1b[0m', furls[i]);
            }
            prevResult[id] = sortedMemberElo;
        }
        else {
            console.log('\x1b[32m', 'SUCCESS: getClanElo Worked Perfectly!');
            prevResult[id] = sortedMemberElo;
        }
        return sortedMemberElo;
    }
 catch (e) {
        console.log(e.message);
    }
}

// return similar object of getClanElo() except without api requests so it is "fake"
// for testing purposes so we don't keep hitting api request limits
async function mockGetClanElo() {
    const memberElo = {
        wood: 2482,
        AyoBlue: 2440,
        DaddyHiZo: 2307,
        Plas: 2232,
        Zxora: 2183,
        ByDynoo: 2179,
        'Lone.': 2027,
        'Love <3 (guy)': 2019,
        'Religious Mantis': 2015,
        sY: 2012,
        JellyTheAce: 2008,
        LemonCherryGelato: 2004,
        Stevie: 1996,
        Krilo: 1951,
        PA1NX: 1903,
        mindbacon: 1881,
        Femboy: 1847,
        lemur: 1843,
        Reeb: 1828,
        AcerMvp: 1810,
        'Anna.': 1802,
        markdoesntfitin: 1746,
        'Black Jesus': 1684,
        // including matt and below causes it to be too long
        Matt_: 1595,
        pepa: 1585,
        AceSwift: 1566,
        precise: 1553,
        Chief: -1,
        'Doom (lagging)': -1,
        'Lil Tjay': -1,
        runingbs: -1,
        torrent: -1,
        wueku1_: -1,
        '4th Global Scythe Queen Boss': -1,
        'Sho Kusakabe': -1,
      };
    return memberElo;
}

let clans = {};
async function getClanMembers(id) {
    try {
        let errorFlag = false;
        let clan;
        let clanMembers = [];
        let clanName = '';
        const clanID = id;
        const req = 'https://api.brawlhalla.com/clan/' + clanID + '/?api_key=' + BHKEY;
        const members = {};
        // this is where the yt video helped me
        await axios.get(req, {timeout: 30000})
        .then(result => {
            clan = result.data.clan;
            clanName = result.data.clan_name;
        })
        .catch(error => {
            // console.log(error);
            errorFlag = true;
            console.log('\x1b[31m', 'ERR: Probably API Rate Limit Reached');
        });
        if (errorFlag) {
            if (clans[id] != null) {
                console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                return clans[id];
            }
            else {
                console.log('\x1b[33m', 'WARNING: No recent data was found/returned');
                return null;
            }
        }
        // create dictionary of all member brawlhalla ids as keys and names as values
        for (let i = 0; i < clan.length; i++) {
            const member = JSON.stringify(clan[i]);
            members[JSON.parse(member).brawlhalla_id] = JSON.parse(member).name;
        }
        // temporarily hardcode console/mobile players
        if (id == '682808') {
            members['45923794'] = 'Jaboogle5274';
            members['47021368'] = 'Mokoffee(Mobile Acc)';
            members['20661966'] = 'KrY Optics';
            members['29471488'] = 'DarkIngram678';
            members['17438506'] = 'Ghheko';
            members['51183832'] = 'Majiama';
        }

        // create dictionary of member's names as keys and their current peak elo as values
        // yt vid helped here too
        let failedIds = [];
        let urls = [];
        for (const id in members) {
            let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
            urls.push(url);
        }

        // determine number of batches to separate requests into to stay under api limit
        const batchSize = 10;
        let batchCount = 0;
        if (urls.length % batchSize == 0) {
            batchCount = urls.length / batchSize;
        }
        else {
            batchCount = Math.floor(urls.length / batchSize) + 1;
        }

        // obtain elo of each member in clan
        let start = 0;
        let end = batchSize;
        let batch = [];

        for (let i = 0; i < batchCount; i++) {
            await sleep(1200).then(async () => {
                batch = urls.slice(start, end);
                console.log(batch);
                await Promise.all(batch.map((url) => {
                    let id = idFromUrl(url);
                    return axios.get(url, {timeout: 30000})
                    .then(result => {
                        // console.log(`got data for ${members[id]}`);
                        const peakElo = result.data.peak_rating;
                        if (peakElo != undefined) {
                            clanMembers.push(result.data);
                        }
                        else {
                            let player = {
                                name: members[`${id}`],
                                brawlhalla_id: parseInt(id),
                                rating: -1,
                                peak_rating: -1,
                            };

                            clanMembers.push(player);
                        }
                    })
                    .catch(error => {
                        // console.log(error);
                        failedIds.push(id);
                        // console.log(`Error getting data for: ${id} (probably timeout error)`);
                    });
                }));

                start += batchSize;
                end += batchSize;
            });
        }
        console.log(`Failed ids: ${failedIds}`);
        // rerun through failed ids
        let furls = [];
        if (failedIds != 0) {
            // create array for failed urls
            for (let i = 0; i < failedIds.length; i++) {
                let id = failedIds[i];
                let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
                furls.push(url);
            }
            failedIds = [];

            // determine number of batches to separate requests into to stay under api limit
            // made it a safer batch size and delay for the reran requests
            const fBatchSize = 5;
            let fBatchCount = 0;
            if (furls.length % fBatchSize == 0) {
                fBatchCount = furls.length / fBatchSize;
            }
            else {
                fBatchCount = Math.floor(furls.length / fBatchSize) + 1;
            }

            // obtain elo for failed request members
            start = 0;
            end = fBatchSize;
            batch = [];
            for (let i = 0; i < fBatchCount; i++) {
                await sleep(2000).then(async () => {
                    batch = furls.slice(start, end);
                    console.log(batch);
                    await Promise.all(batch.map((url) => {
                        let id = idFromUrl(url);
                        return axios.get(url, {timeout: 30000})
                        .then(result => {
                            // console.log(`got data for ${members[id]}`);
                            const peakElo = result.data.peak_rating;
                            if (peakElo != undefined) {
                                clanMembers.push(result.data);
                            }
                            else {
                                let player = {
                                    name: members[`${id}`],
                                    brawlhalla_id: parseInt(id),
                                    rating: -1,
                                    peak_rating: -1,
                                };
                                clanMembers.push(player);
                            }
                        })
                        .catch(error => {
                            // console.log(error);
                            failedIds.push(id);
                            // console.log(`Error getting data for: ${id} (probably timeout error)`);
                        });
                    }));

                    start += fBatchSize;
                    end += fBatchSize;
                });
            }
        }

        let sortedMemberData = clanMembers.sort(compareValues('peak_rating', 'desc'));
        // check for ids with errors
        if (failedIds.length != 0) {
            for (let i = 0; i < failedIds.length; i++) {
                console.log('\x1b[31m', `ERR: Obtaining data for ${failedIds[i]}`);
                if (clans[id] != null) {
                    console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                    return clans[id];
                }
                else {
                    return null;
                }
            }
        } else if (furls.length != 0) {
            console.log('\x1b[32m', 'SUCCESS: But had to do another request with');
            for (let i = 0; i < furls.length; i++) {
                console.log('\x1b[0m', furls[i]);
            }
            clans[id] = [clanName, sortedMemberData];
        }
        else {
            console.log('\x1b[32m', 'SUCCESS: getClanElo Worked Perfectly!');
            clans[id] = [clanName, sortedMemberData];
        }

        return [clanName, sortedMemberData];
    }
 catch (e) {
        console.log(e.message);
    }
}

async function mockGetClanMembers() {
    return [
        {
          name: 'â½\x95Scorch',
          brawlhalla_id: 9283507,
          rating: 2416,
          peak_rating: 2416,
          tier: 'Diamond',
          wins: 273,
          games: 426,
          region: 'US-W',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'â½\x95Scorch',
            brawlhalla_id: 9283507,
            rating: 1564,
            peak_rating: 1573,
            tier: 'Gold 4',
            wins: 32,
            games: 41,
            region: 'US-E'
          }
        },
        {
          name: 'Unruly | Empty',
          brawlhalla_id: 41241821,
          rating: 2412,
          peak_rating: 2412,
          tier: 'Diamond',
          wins: 83,
          games: 141,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          rotating_ranked: []
        },
        {
          name: 'b1unts',
          brawlhalla_id: 3843154,
          rating: 2403,
          peak_rating: 2407,
          tier: 'Diamond',
          wins: 45,
          games: 58,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object], [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'Ryukira',
          brawlhalla_id: 55048991,
          rating: 2200,
          peak_rating: 2272,
          tier: 'Diamond',
          wins: 92,
          games: 158,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'Ryukira',
            brawlhalla_id: 55048991,
            rating: 1341,
            peak_rating: 1341,
            tier: 'Silver 5',
            wins: 9,
            games: 9,
            region: 'US-E'
          }
        },
        {
          name: 'Celsior',
          brawlhalla_id: 55978588,
          rating: 2214,
          peak_rating: 2259,
          tier: 'Diamond',
          wins: 32,
          games: 47,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: []
        },
        {
          name: 'YuK.',
          brawlhalla_id: 76558389,
          rating: 2114,
          peak_rating: 2259,
          tier: 'Diamond',
          wins: 392,
          games: 787,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'YuK.',
            brawlhalla_id: 76558389,
            rating: 1585,
            peak_rating: 1596,
            tier: 'Gold 4',
            wins: 35,
            games: 44,
            region: 'US-E'
          }
        },
        {
          name: 'Azu',
          brawlhalla_id: 3543820,
          rating: 2197,
          peak_rating: 2244,
          tier: 'Diamond',
          wins: 52,
          games: 88,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'Vogel',
          brawlhalla_id: 3505646,
          rating: 2227,
          peak_rating: 2227,
          tier: 'Diamond',
          wins: 10,
          games: 10,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'Vogel',
            brawlhalla_id: 3505646,
            rating: 1449,
            peak_rating: 1449,
            tier: 'Gold 2',
            wins: 18,
            games: 19,
            region: 'US-E'
          }
        },
        {
          name: 'KrY Optics',
          brawlhalla_id: 20661966,
          rating: 2203,
          peak_rating: 2203,
          tier: 'Diamond',
          wins: 24,
          games: 30,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'KrY Optics',
            brawlhalla_id: 20661966,
            rating: 1417,
            peak_rating: 1448,
            tier: 'Gold 1',
            wins: 20,
            games: 27,
            region: 'US-E'
          }
        },
        {
          name: 'zacky',
          brawlhalla_id: 3231237,
          rating: 2121,
          peak_rating: 2165,
          tier: 'Diamond',
          wins: 44,
          games: 74,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'zacky',
            brawlhalla_id: 3231237,
            rating: 1296,
            peak_rating: 1296,
            tier: 'Silver 4',
            wins: 6,
            games: 6,
            region: 'US-E'
          }
        },
        {
          name: 'Syeddy',
          brawlhalla_id: 43936530,
          rating: 2014,
          peak_rating: 2117,
          tier: 'Diamond',
          wins: 134,
          games: 248,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'sortie y2k',
          brawlhalla_id: 46025550,
          rating: 1976,
          peak_rating: 2095,
          tier: 'Diamond',
          wins: 162,
          games: 314,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'sortie y2k',
            brawlhalla_id: 46025550,
            rating: 1467,
            peak_rating: 1513,
            tier: 'Gold 2',
            wins: 29,
            games: 39,
            region: 'US-E'
          }
        },
        {
          name: 'Solzda',
          brawlhalla_id: 553289,
          rating: 2078,
          peak_rating: 2078,
          tier: 'Diamond',
          wins: 9,
          games: 10,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [ [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'BicBoi3',
          brawlhalla_id: 11333466,
          rating: 2036,
          peak_rating: 2076,
          tier: 'Diamond',
          wins: 101,
          games: 187,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'BicBoi3',
            brawlhalla_id: 11333466,
            rating: 1332,
            peak_rating: 1333,
            tier: 'Silver 4',
            wins: 9,
            games: 10,
            region: 'US-E'
          }
        },
        {
          name: 'Cake',
          brawlhalla_id: 2447718,
          rating: 2019,
          peak_rating: 2057,
          tier: 'Diamond',
          wins: 79,
          games: 139,
          region: 'US-W',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'Cake',
            brawlhalla_id: 2447718,
            rating: 1250,
            peak_rating: 1250,
            tier: 'Silver 3',
            wins: 3,
            games: 3,
            region: 'US-W'
          }
        },
        {
          name: 'Jaboogle5274',
          brawlhalla_id: 45923794,
          rating: 2007,
          peak_rating: 2050,
          tier: 'Diamond',
          wins: 73,
          games: 127,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: []
        },
        {
          name: 'brendaddy',
          brawlhalla_id: 9989745,
          rating: 1870,
          peak_rating: 2002,
          tier: 'Diamond',
          wins: 103,
          games: 193,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [ [Object], [Object], [Object], [Object] ],
          '2v2': [ [Object] ],
          rotating_ranked: {
            name: 'brendaddy',
            brawlhalla_id: 9989745,
            rating: 1589,
            peak_rating: 1684,
            tier: 'Gold 4',
            wins: 54,
            games: 67,
            region: 'US-E'
          }
        },
        {
          name: 'thatguy',
          brawlhalla_id: 3219348,
          rating: 1965,
          peak_rating: 1980,
          tier: 'Platinum 5',
          wins: 11,
          games: 15,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ],
          rotating_ranked: {
            name: 'thatguy',
            brawlhalla_id: 3219348,
            rating: 1337,
            peak_rating: 1366,
            tier: 'Silver 4',
            wins: 12,
            games: 16,
            region: 'US-E'
          }
        },
        {
          name: 'Luni',
          brawlhalla_id: 9845707,
          rating: 1835,
          peak_rating: 1909,
          tier: 'Platinum 3',
          wins: 76,
          games: 149,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [ [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'Mokoffee',
          brawlhalla_id: 47021368,
          rating: 1822,
          peak_rating: 1843,
          tier: 'Platinum 3',
          wins: 24,
          games: 42,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [ [Object], [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'Mokoffee',
            brawlhalla_id: 47021368,
            rating: 1475,
            peak_rating: 1475,
            tier: 'Gold 2',
            wins: 38,
            games: 58,
            region: 'US-E'
          }
        },
        {
          name: 'Think.PNF',
          brawlhalla_id: 6396194,
          rating: 1745,
          peak_rating: 1827,
          tier: 'Platinum 2',
          wins: 78,
          games: 153,
          region: 'US-W',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object],
            [Object], [Object], [Object], [Object]
          ],
          '2v2': [ [Object], [Object], [Object] ],
          rotating_ranked: {
            name: 'Think.PNF',
            brawlhalla_id: 6396194,
            rating: 1314,
            peak_rating: 1314,
            tier: 'Silver 4',
            wins: 7,
            games: 7,
            region: 'US-E'
          }
        },
        {
          name: 'Briyoda',
          brawlhalla_id: 53692,
          rating: 1806,
          peak_rating: 1806,
          tier: 'Platinum 2',
          wins: 15,
          games: 24,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [ [Object], [Object] ],
          rotating_ranked: []
        },
        {
          name: 'kc',
          brawlhalla_id: 8681175,
          rating: 1760,
          peak_rating: 1794,
          tier: 'Platinum 2',
          wins: 28,
          games: 53,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [ [Object], [Object] ],
          rotating_ranked: {
            name: 'kc',
            brawlhalla_id: 8681175,
            rating: 1260,
            peak_rating: 1260,
            tier: 'Silver 3',
            wins: 4,
            games: 4,
            region: 'US-E'
          }
        },
        {
          name: 'Avalon',
          brawlhalla_id: 10356664,
          rating: 1592,
          peak_rating: 1649,
          tier: 'Gold 4',
          wins: 16,
          games: 31,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object]
          ],
          '2v2': [],
          rotating_ranked: []
        },
        {
          name: 'Mokoffee',
          brawlhalla_id: 67266260,
          rating: 1571,
          peak_rating: 1571,
          tier: 'Gold 4',
          wins: 6,
          games: 10,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object]
          ],
          '2v2': [ [Object] ],
          rotating_ranked: []
        },
        {
          name: 'Gnortius',
          brawlhalla_id: 48504501,
          rating: 1662,
          peak_rating: 1568,
          tier: 'Gold 4',
          wins: 3,
          games: 4,
          region: 'US-E',
          global_rank: 0,
          region_rank: 0,
          legends: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object]
          ],
          '2v2': [ [Object] ],
          rotating_ranked: []
        },
        {
          name: 'Doernbecher',
          brawlhalla_id: 10182480,
          rating: -1,
          peak_rating: -1
        }
      ];
}
// print result of getClanElo()
async function printClanElo(id) {
    let res = await getClanElo(id);
    console.log(res);
}

// print result of mockGetClanElo()
async function mockPrintClanElo() {
    let res = await mockGetClanElo();
    console.log(res);
}

module.exports = {
    getClanElo,
    mockGetClanElo,
    getClanMembers,
    mockGetClanMembers,
};

// this for loop is the slow version of the api request for all members, leaving it here in case
// new faster version doesnt work
//         for (const id in members) {
//             let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
// // specifically this "await" is the key
//             await axios.get(url)
//             .then(result => {
//                 const peakElo = result.data.peak_rating;
//                 if (peakElo != undefined) {
//                     memberElo[members[id]] = peakElo;
//                 }
//                 else {
//                     memberElo[members[id]] = -1;
//                 }
//             })
//             .catch(error => {
//                 // console.log(error);
//                 failedIds.push(id);
//                 // console.log(`Error getting data for: ${id} (probably timeout error)`);
//             });
//         }
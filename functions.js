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
        await axios.get(req)
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
            members['47021368'] = 'Mokoffee(Mobile Acc)';
            members['20661966'] = 'KrY Optics';
        }

        // create dictionary of member's names as keys and their current peak elo as values
        // yt vid helped here too
        let failedIds = [];
        let urls = [];
        for (const id in members) {
            let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
            urls.push(url);
        }

        // obtain elo of each member in clan
        await Promise.all(urls.map((url) => {
            let id = idFromUrl(url);
            return axios.get(url)
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

        // rerun through failed ids
        furls = [];
        if (failedIds != 0) {
            for (let i = 0; i < failedIds.length; i++) {
                let id = failedIds[i];
                let url = 'https://api.brawlhalla.com/player/' + id + '/ranked?api_key=' + BHKEY;
                furls.push(url);
            }
            failedIds = [];
            await Promise.all(furls.map((url) => {
                let id = idFromUrl(url);
                return axios.get(url)
                .then(result => {
                    // console.log(`got data for 2nd run through for ${members[id]}`);
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
                    // console.log(`Error getting data for: ${id} (ERROR)`);
                });
            }));
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
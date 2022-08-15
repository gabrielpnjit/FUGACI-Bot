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
async function getClanElo() {
    try {
        let errorFlag = false;
        let clan;
        let clanID = '682808';
        let req = 'https://api.brawlhalla.com/clan/' + clanID + '/?api_key=' + BHKEY;
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
            if (Object.keys(prevResult).length != 0) {
                console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                return prevResult;
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
        members['45923794'] = 'Jaboogle5274';
        members['47021368'] = 'Mokoffee(Mobile Acc)';
        members['20661966'] = 'KrY Optics';

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
                if (Object.keys(prevResult).length != 0) {
                    console.log('\x1b[32m', 'SUCCESS: Returned most recent successful data');
                    return prevResult;
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
            prevResult = sortedMemberElo;
        }
        else {
            console.log('\x1b[32m', 'SUCCESS: getClanElo Worked Perfectly!');
            prevResult = sortedMemberElo;
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
        b1unts: 2018,
        Logic: 1972,
        Celsior: 1971,
        'YuK.': 1960,
        Avocuddle: 1959,
        Vogel: 1886,
        Amaterazu: 1868,
        Luni: 1858,
        Cake: 1714,
        Solzda: 1697,
        Briyoda: 1687,
        Avalon: 1618,
        zacky: -1,
        Doernbecher: -1,
        'Unruly | Empty': -1,
        'twitch.tv/doobstreams': -1,
        'sortie y2k': -1,
        Gnortius: -1,
        Mokoffee: -1,
        kikalmighty: -1,
      };
    return memberElo;
}

// print result of getClanElo()
async function printClanElo() {
    let res = await getClanElo();
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
require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const BHKEY = process.env.BH_KEY;
const axios = require('axios');
const fs = require('fs');
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
            members['17438506'] = 'Ghheko';
            members['15764551'] = 'rango';
            members['14630779'] = 'wallahi';
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
        // temporarily hardcode console/mobile players and linked accounts
        if (id == '682808') {
            members['45923794'] = 'Jaboogle5274';
            members['20661966'] = 'KrY Optics';
            members['17438506'] = 'Ghheko';
            members['15764551'] = 'rango';
            members['14630779'] = 'wallahi';
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

// print result of getClanElo()
async function printClanElo(id) {
    let res = await getClanElo(id);
    console.log(res);
}

// update Clan data in clans.json file and sends message when there is a difference
async function updateClanData(clanID, client, channelID) {
    currentDate = new Date();
    const currentDateTimeString = currentDate.toLocaleString("en-US", { timeZone: "America/New_York" })
    console.log(`Checking Clan Data and Logs: ${currentDateTimeString}`)
    const req = 'https://api.brawlhalla.com/clan/' + clanID + '/?api_key=' + BHKEY;

    const channel = await client.channels.fetch(channelID)
    if (!channel) {
        console.warn(`Channel not found!: ${channel}`);
        return;
    }

    let oldClanData = JSON.parse((fs.readFileSync('clan-logs.json', 'utf8')));
    let newClanData = {}

    await axios.get(req, {timeout: 30000})
    .then(async result => {
        newClanData = result.data;

        let leavesArr = await arrayDifference(oldClanData.clan, newClanData.clan)
        let joinsArr = await arrayDifference(newClanData.clan, oldClanData.clan)
        let xpDiffArr = getXpDifferences(oldClanData, newClanData)
        let totalXpDiff = newClanData.clan_xp - oldClanData.clan_xp
        // console.log(`Leaves Array: ${JSON.stringify(leavesArr)}`)
        // console.log(`Joins Array: ${JSON.stringify(joinsArr)}`)
        
        // reminder that fs.writeFile is async
        fs.writeFile('clan-logs.json', JSON.stringify(newClanData, null, 4), (err) => {
            if (err) throw err;
            console.log('clan-logs.json updated successfully')
        });

        // let leavesNames = leavesArr.map(obj => obj.name)
        // let joinsNames = joinsArr.map(obj => obj.name)

        if (leavesArr.length <= 0 && joinsArr.length <= 0 && xpDiffArr.length <= 0) {
            console.log('No new clan log updates');
            return;
        }

        oldMemberCount = oldClanData.clan.length
        newMemberCount = newClanData.clan.length
    
        // create embedded message
        const embed = new EmbedBuilder()
        .setTitle('FUGACI Clan Updates')
        .setColor('#E78230')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1132466915550437476/FUGACI_2.png')
        .setDescription(`Members ${oldMemberCount} → ${newMemberCount}`)
        .setTimestamp();

        // for later to use to find xp diff: oldClanData.clan.find(member => member.name === leavesArr[i].name).join_date
        if (joinsArr.length >= 1) {
            let joinsString = '';
            for (let i = 0; i < joinsArr.length; i++) {
                joinDate = joinsArr[i].join_date;
                joinsString += `➕ [**${joinsArr[i].name.replace(/[^\x00-\x7F]/g, "")}**](https://corehalla.com/stats/player/${joinsArr[i].brawlhalla_id}) - Joined <t:${joinDate}:R>\n`;
            }
            embed.addFields({ name: 'Joins 🟢', value: joinsString })
            console.log(joinsArr);
        }

        if (leavesArr.length >= 1) {
            let leavesString = '';
            for (let i = 0; i < leavesArr.length; i++) {
                timeMember = Math.floor(Date.now() / 1000) - leavesArr[i].join_date;
                leavesString += `➖ [**${leavesArr[i].name.replace(/[^\x00-\x7F]/g, "")}**](https://corehalla.com/stats/player/${leavesArr[i].brawlhalla_id}) - Member for ${(timeMember / 86400).toFixed(1)} Days\n`; // timeMember is in seconds so convert to days
            }
            embed.addFields({ name: 'Leaves 🔴', value: leavesString })
            console.log(leavesArr);
        }

        if (xpDiffArr.length >= 1) {
            let xpDiffsString = '';
            for (let i = 0; i < xpDiffArr.length; i++) {
                xpDiffsString += `${xpDiffArr[i].name.replace(/[^\x00-\x7F]/g, "")}: +${xpDiffArr[i].xp_diff} XP\n`
            }
            embed.addFields({ name: `Clan XP Gained: +${totalXpDiff} XP`, value: xpDiffsString })
        }

        channel.send({ embeds: [embed] })
            .then(() => console.log(`Clan logs sent`))
            .catch(err => console.error(`Error sending clan logs message: ${err}`));
    })
    .catch(error => {
        console.log(error);
        errorFlag = true;
        console.log('\x1b[31m', 'ERR: Probably API Rate Limit Reached');
    });
}

// return difference in arrays of brawlhalla user objects on brawlhalla_ids
function arrayDifference(arr1, arr2) {
    const difference = arr1.filter(obj1 => 
        !arr2.some(obj2 => obj2.brawlhalla_id === obj1.brawlhalla_id));
    return difference;
}

function getXpDifferences(oldClanData, newClanData) {
    let memberArr = []

    for (let i = 0; i < oldClanData.clan.length; i++) {
        let oldMember = oldClanData.clan[i];
        for (let j = 0; j < newClanData.clan.length; j++) {
            let newMember = newClanData.clan[j];
            if (oldMember.brawlhalla_id == newMember.brawlhalla_id && newMember.xp > oldMember.xp) {
                newMember.xp_diff = newMember.xp - oldMember.xp
                memberArr.push(newMember);
            }
        }
    }

    memberArr.sort((a, b) => b.xp_diff - a.xp_diff); // sort from greatest to least

    return memberArr
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

module.exports = {
    getClanElo,
    getClanMembers,
    updateClanData,
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
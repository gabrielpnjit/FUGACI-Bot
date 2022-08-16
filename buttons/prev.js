// honestly this file isn't really useful
// only exists to not have console output button error
module.exports = {
    data: {
        name: 'next',
    },
    async execute(interaction) {
        console.log('next button was clicked');
    },
};
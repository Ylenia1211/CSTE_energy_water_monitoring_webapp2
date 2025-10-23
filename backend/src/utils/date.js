const moment = require('moment-timezone');

function getCurrentDateInLocalTimezone() {
    // Ottieni la data corrente nel fuso orario locale e converti in formato ISO 8601 con fuso orario (+00:00)
    return moment().tz('Europe/Rome').toDate();
}

//.format('YYYY-MM-DDTHH:mm:ss.SSS+00:00')

// const currentDate = getCurrentDateInLocalTimezone();
// console.log("Data nel formato corretto:", currentDate);

  module.exports = {getCurrentDateInLocalTimezone};
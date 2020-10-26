import dayjs from "dayjs";

function determineStatus(dateDebut, dateFinReelle) {
  let status = "";


    if (dateFinReelle === "") {
        if (dayjs().isBefore(dateDebut)) {
            status = "no_start";
        } else {
            status = "in_progress";
        }
    } else {
        if (dayjs().diff(dateFinReelle, 'day') > 7) {
            status = "archived";
        } else {
            status = "finished";
        }
    }
  }
  return status;
}

function formatDate(date) {
  if(date!==""){
    return dayjs(date).format('DD/MM/YYYY');
  }
}

function formatDateForm(date) {
    return dayjs(date).format('YYYY-MM-DD');
}

function formatDateHours(date) {
    return dayjs(date).format('DD/MM/YYYY à HH:mm:ss');
}

function now() {
    return dayjs();
}

function verifyDateExist(date) {
    if (dayjs(date).isSame("1900-01-01T00:00:00+00:00")) {
        return "";
    } else {
        return date;
    }
}

function dateIsAfter(dateToCompare, dateDebut, dateFinPrevues) {
  if (!dateIsAfterDebut(dateToCompare, dateDebut)) {
    return false;
  }

  let higherDate = "1900-01-01T00:00:00+00:00";

    dateFinPrevues.map(
        date => {
            if (!dayjs(higherDate).isAfter(date.date)) {
                higherDate = date.date;
                console.log(higherDate);
                console.log(date.date);
            }
        }
    )
    console.log(higherDate);

    return dayjs(dateToCompare).isAfter(higherDate);
}


function dateIsAfterDebut(dateToCompare, dateDebut) {
    return dayjs(dateToCompare).isAfter(dateDebut);
}
//Remettre la fonction retard en dayjs
function retard(dateFin, dateDebut) {
  if (dateFin !== "") {
    return moment(dateFin).diff(moment(dateDebut), "days");
  } else if (now().diff(moment(dateDebut), "days") > 0) {
    return now().diff(moment(dateDebut), "days");
  }
}


export default {
    determineStatus,
    formatDate,
    formatDateHours,
    verifyDateExist,
    formatDateForm,
    dateIsAfter,
    dateIsAfterDebut,
    now,
  retard,
}

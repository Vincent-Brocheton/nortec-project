import moment from "moment";

function determineStatus(dateDebut, dateFinReelle) {
  let status = "";

  if (dateFinReelle === "") {
    if (moment().isBefore(dateDebut)) {
      status = "no_start";
    } else {
      status = "in_progress";
    }
  } else {
    if (moment().diff(dateFinReelle, "days") > 7) {
      status = "archived";
    } else {
      status = "finished";
    }
  }
  return status;
}

function formatDate(date) {
  if(date!==""){
    return moment(date).format("DD/MM/YYYY");
  }
}

function formatDateForm(date) {
  return moment(date).format("YYYY-MM-DD");
}

function formatDateHours(date) {
  return moment(date).format("DD/MM/YYYY à h:mm:ss");
}

function now() {
  return moment();
}

function verifyDateExist(date) {
  if (moment(date).isSame("1900-01-01T00:00:00+00:00")) {
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

  dateFinPrevues.map((date) => {
    if (moment(higherDate).isSameOrBefore(date.date)) {
      higherDate = date.date;
      console.log(higherDate);
      console.log(date.date);
    }
  });
  console.log(higherDate);

  return !moment(dateToCompare).isSameOrBefore(higherDate);
}

function dateIsAfterDebut(dateToCompare, dateDebut) {
  return !moment(dateToCompare).isSameOrBefore(dateDebut);
}

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
};

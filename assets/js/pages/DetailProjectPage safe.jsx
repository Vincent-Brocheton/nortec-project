import React, { useEffect, useState, Suspense } from "react";
import "../../css/detailProjectPage.css";
import "../../css/loading-icon.css";
import ImgComponent from "../components/images/ImgComponent";
import Button from "../components/forms/Button";
import { Link } from "react-router-dom";
import DateAPI from "../services/DateAPI";
import ProjectsAPI from "../services/ProjectsAPI";
import AuthAPI from "../services/AuthAPI";
import Field from "../components/forms/Field";
import FieldTextArea from "../components/forms/FieldTextArea";
import { toast } from "react-toastify";
import {
  determineStatusClasses,
  determineStatusLabel,
} from "../components/ProjectStatus";
import Modal from "react-bootstrap/Modal";
import Select from "../components/forms/Select";
import ReportsAPI from "../services/ReportsAPI";
import useClippy from "use-clippy";

const DetailProjectPage = ({ history, match, props }) => {
  const { id } = match.params;

  const [error, setError] = useState({
    name: "",
    description: "",
    photo: "",
    adresse1: "",
    adresse2: "",
    codePostal: "",
    dateDebut: "",
    dateFinReelle: "",
    dateFinPrevues: "",
    nomMOEX: "",
    nomOPC: "",
    contactClient: "",
    ville: "",
    reports: "",
    users: "",
    lots: "",
    companies: "",
  });

  const [project, setProject] = useState({
    name: "",
    description: "",
    photo: "../img/projects-img/projects-general-img/no-photo-project-img.jpg",
    adresse1: "",
    adresse2: "",
    codePostal: "",
    dateDebut: "",
    dateFinReelle: "1900-01-01",
    nomMOEX: "",
    nomOPC: "",
    contactClient: "",
    ville: "",
    reports: [],
    users: [],
    lots: [],
    companies: [],
  });
  const [lotsModel, setLotsModel] = useState({
    numeroLot: "",
    libelleLot: "",
    DateDebutEcheance: "1900-01-01",
    dateFinEcheance: "1900-01-01",
    company: "",
    project: "",
    annuaire: "",
  });

  const [lots, setLots] = useState({
    numeroLot: "",
    libelleLot: "",
    DateDebutEcheance: "1900-01-01",
    dateFinEcheance: "1900-01-01",
    company: "",
    project: "",
    annuaire: "",
  });

  const [dateFinPrevue, setDateFinPrevue] = useState("");
  const [edit, setEdit] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [errorDate, setErrorDate] = useState("");
  const [errorDateFinReelle, setErrorDateFinRelle] = useState("");
  const [showLotModal, setShowLotModal] = useState(false);
  const [showEcheanceModal, setShowEcheanceModal] = useState(false);
  const [addLot, setAddLot] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState({
    Project: "/api/projects/" + id,
    redacteur: AuthAPI.getUserFirstNameLastName(),
    dateRedaction: DateAPI.now(),
    status: "in_progress",
    propreteAccessConformity: "",
    propreteAccessComment: "",
    propreteAccessCommentIntern: "",
    propreteCommuneConformity: true,
    propreteCommuneComment: "",
    propreteCommuneCommentIntern: "",
    securityConformity: true,
    securityComment: "",
    securityCommentIntern: "",
    installations: "",
    lots: [],
  });

  const [clipboard, setClipboard] = useClippy();
  const handleClipboard = ({ currentTarget }) => {
    const value = currentTarget.innerText;
    setClipboard(value);
    console.log(value);
    toast.info("Copié dans le presse-papier");
  };

  //----------------------------------------Récupération d'un projet----------------------------
  const fetchProject = async (id) => {
    // console.log(id)
    try {
      const data = await ProjectsAPI.find(id);
      setProject(data);
      setLoadingProject(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await ReportsAPI.findAll();

      setReports(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  //Récupération du bon projet à chaque chargement du composant

  //---------------------------------------- Chargement de projet au changement de l'id --------
  useEffect(() => {
    fetchProject(id).then((r) => "");
    fetchReports();
  }, [id]);

  // useEffect(() => {
  //   fetchReports();
  // }, []);

  console.log(project);

  const handleBackClick = () => {
    history.replace("/projects");
  };

  const handleEditClick = () => {
    setEdit(!edit);
  };

  const newReportClick = async () => {
    let idMax;
    let idNewReport;
    if (reports.length !== 0) {
      idMax = reports[reports.length - 1].id;
      idNewReport = idMax + 1;
    } else {
      idNewReport = 1;
    }
    try {
      await ReportsAPI.create(report);
      console.log(report);
      history.replace("/project/" + id + "/" + idNewReport + "/effectifs");
      toast.success("Nouveau rapport créé");
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setProject({ ...project, [name]: value });
  };

  const handleChangeDateFinPrevue = ({ currentTarget }) => {
    const { value } = currentTarget;
    setDateFinPrevue(value);
  };

  const addFinPrevue = async (e) => {
    e.preventDefault();

    if (
      DateAPI.dateIsAfter(
        dateFinPrevue,
        project.dateDebut,
        project.dateFinPrevues
      )
    ) {
      setErrorDate("");
      try {
        const dateToCreate = {
          date: dateFinPrevue,
          Project: "/api/projects/" + project.id,
        };

        await ProjectsAPI.addFinPrevueProject(dateToCreate).then((r) => {
          project.dateFinPrevues.push(dateToCreate);
          setProject(project);
        });

        toast.success("La date a bien été ajoutée.");
        setEdit(false);
      } catch (error) {
        console.log(error);
        toast.error("Une erreur est survenue pendant l'ajout de la date.");
      }
    } else {
      setErrorDate("La nouvelle date doit être postérieure aux autres");
    }
  };

  const handleChangeFinReelle = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setProject({ ...project, [name]: value });

    DateAPI.dateIsAfterDebut(project.dateFinReelle, project.dateDebut)
      ? setErrorDateFinRelle("")
      : setErrorDateFinRelle(
          "La date de fin réélle doit être postérieure à la date de début!"
        );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      project.users = project.users.map(
        (userInProject) => "/api/users/" + userInProject.id
      );
      project.dateFinPrevues = project.dateFinPrevues.map(
        (dateInProject) => "/api/project_date_fin_prevues/" + dateInProject.id
      );
      project.lots = project.lots.map((lot) => "/api/lots/" + lot.id);
      await ProjectsAPI.update(id, project);
      toast.success("Le projet a bien été mis à jour !");
      await fetchProject(id);
      // fetchUsers();
      setEdit(false);
    } catch ({ response }) {
      toast.error("Un problème est survenu pendant la mise à jour du projet.");
      console.log(id);
      console.log(project);
      console.log(error);
      console.log(response);
    }
  };

  // console.log(project);
  // console.log(project.dateFinPrevues);

  //--------------------------------------------GESTION DES LOTS--------------------------------------------------------

  const handleCloseLotModal = () => {
    setShowLotModal(false);
    setAddLot(false);
    setLots(lotsModel);
  };

  const handleShowLotModal = () => {
    setShowLotModal(true);
    fetchCompany().then((r) => "");
  };

  const handleAddLot = () => {
    setAddLot(true);
  };

  const handleCloseAddLot = () => {
    setAddLot(false);
    setLots(lotsModel);
  };

  const handleChangeLot = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setLots({ ...lots, [name]: value });
  };
  useEffect(() => {
    setLots({ ...lots, annuaire: "" });
  }, [lots.company]);

  const handleSubmitLot = async (event) => {
    event.preventDefault();

    console.log(lots.company);
    console.log(company);

    setAddLot(false);

    try {
      lots.project = "/api/projects/" + project.id;
      lots.company = "/api/companies/" + lots.company;
      lots.annuaire = "/api/annuaires/" + lots.annuaire;

      console.log(lots.company);
      console.log(lots);

      await ProjectsAPI.addLotProject(lots);

      toast.success("Le lot est bien ajouté !");
    } catch ({ response }) {
      const { violations } = response.data;
      if (violations) {
        const apiErrors = {};
        violations.map(({ propertyPath, message }) => {
          apiErrors[propertyPath] = message;
        });

        setError(apiErrors);
      }
      console.log(response);
    }
    fetchProject(id);
    setLots(lotsModel);
  };

  //-----------------------------------------COMPANY FOR LOT------------------------------------------------------

  const fetchCompany = async () => {
    try {
      const data = await ProjectsAPI.findAllCompany();
      setCompanies(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  //-------------------------------------Affichage des échéances--------------------------------------------------

  const handleCloseEcheanceModal = () => {
    setShowEcheanceModal(false);
  };

  const handleShowEcheanceModal = () => {
    setShowEcheanceModal(true);
  };

  //--------------------------------------------Template  --------------------------------------------------------

  return (
    <main className="container">
      <div className="card m-4 p-2">
        {!loadingProject ? (
          <>
            {!edit ? (
              <>
                <h2 className="mb-4">{project.name}</h2>
                <p className="description-style">{project.description}</p>
                <div className="d-flex flex-lg-row flex-column mt-2">
                  <ImgComponent
                    alt={project.name}
                    src={project.photo}
                    className="col-12 col-lg-6 mx-auto img-fluid rounded img-style"
                  />

                  <div className="col-12 col-lg-6">
                    <h5 className="text-center text-sm-left mb-3">Détails:</h5>
                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Adresse :</h6>
                      <p className="col-7">{project.adresse1}</p>
                    </div>
                    {project.adresse2 && (
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Complément :</h6>
                        <p className="col-7">{project.adresse2}</p>
                      </div>
                    )}

                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Code Postal :</h6>
                      <p className="col-7">{project.codePostal}</p>
                    </div>
                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Ville :</h6>
                      <p className="col-7">{project.ville}</p>
                    </div>
                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Date de début :</h6>
                      <p className="col-7">
                        {DateAPI.formatDate(project.dateDebut)}
                      </p>
                    </div>

                    {project.dateFinPrevues.length !== 0 && (
                      <>
                        {project.dateFinPrevues.map((date) => (
                          <div className="row no-space" key={date.id}>
                            <h6 className="offset-sm-1 col-4">
                              Fin prévue{" "}
                              {project.dateFinPrevues.indexOf(date) + 1} :
                            </h6>
                            <p className="col-7">
                              {DateAPI.formatDate(date.date)}
                            </p>
                          </div>
                        ))}
                      </>
                    )}

                    {DateAPI.verifyDateExist(project.dateFinReelle) === "" ? (
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">
                          Date de fin réélle :
                        </h6>
                        <p className="col-7">Aucune</p>
                      </div>
                    ) : (
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">
                          Date de fin réélle :
                        </h6>
                        <p className="col-7">
                          {DateAPI.formatDate(project.dateFinReelle)}
                        </p>
                      </div>
                    )}

                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Nom MOEX :</h6>
                      <p className="col-7">{project.nomMOEX}</p>
                    </div>

                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Nom OPC :</h6>
                      <p className="col-7">{project.nomOPC}</p>
                    </div>

                    <div className="row no-space">
                      <h6 className="offset-sm-1 col-4">Contact client :</h6>
                      <a
                        className="col-7"
                        href={"mailto:" + project.contactClient}
                      >
                        {project.contactClient}
                      </a>
                    </div>

                    <div className="row mt-5">
                      <h6 className="offset-sm-1 col-4">Statut :</h6>
                      <p
                        className={
                          "col-2 badge badge-" +
                          determineStatusClasses(
                            project.dateDebut,
                            project.dateFinReelle
                          )
                        }
                      >
                        {determineStatusLabel(
                          project.dateDebut,
                          project.dateFinReelle
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <Field
                    name="name"
                    label="Nom du projet"
                    placeholder="Entrez le nom du projet"
                    onChange={handleChange}
                    value={project.name}
                    error={error.name}
                  />

                  <FieldTextArea
                    name="description"
                    label="Decription du projet"
                    rows="3"
                    placeholder="Entrez la description du projet"
                    onChange={handleChange}
                    value={project.description}
                    error={error.description}
                  />

                  <div className="d-flex flex-lg-row flex-column mt-2">
                    <ImgComponent
                      alt={project.name}
                      src={project.photo}
                      className="col-12 col-lg-6 mx-auto img-fluid rounded img-style"
                    />

                    <div className="col-12 col-lg-6">
                      <h5 className="mb-3">Détails:</h5>
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Adresse :</h6>
                        <Field
                          className="col-7"
                          name="adresse1"
                          placeholder="Entrez le numéro et la rue"
                          onChange={handleChange}
                          value={project.adresse1}
                          error={error.adresse1}
                          noLabel={true}
                        />
                      </div>
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Complément :</h6>
                        <Field
                          className="col-7"
                          name="adresse2"
                          placeholder="Complément"
                          onChange={handleChange}
                          value={project.adresse2}
                          error={error.adresse2}
                          noLabel={true}
                        />
                      </div>

                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Code Postal :</h6>
                        <Field
                          className="col-7"
                          name="codePostal"
                          placeholder="Complément"
                          onChange={handleChange}
                          value={project.codePostal}
                          error={error.codePostal}
                          noLabel={true}
                        />
                      </div>
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Ville :</h6>
                        <Field
                          className="col-7"
                          name="ville"
                          placeholder="Complément"
                          onChange={handleChange}
                          value={project.ville}
                          error={error.ville}
                          noLabel={true}
                        />
                      </div>
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Date de début :</h6>
                        <Field
                          name="dateDebut"
                          type="date"
                          onChange={handleChange}
                          value={DateAPI.formatDateForm(project.dateDebut)}
                          error={error.dateDebut}
                          noLabel={true}
                        />
                      </div>

                      {project.dateFinPrevues.length !== 0 && (
                        <>
                          {project.dateFinPrevues.map((date) => (
                            <div className="row no-space" key={date.id}>
                              <h6 className="offset-sm-1 col-4">
                                Fin prévue{" "}
                                {project.dateFinPrevues.indexOf(date) + 1} :
                              </h6>
                              <p className="col-7">
                                {DateAPI.formatDate(date.date)}
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">
                          Ajouter une date de fin prévue :
                        </h6>
                        <Field
                          name="dateFinPrevue"
                          type="date"
                          onChange={handleChangeDateFinPrevue}
                          value={DateAPI.formatDateForm(dateFinPrevue)}
                          noLabel={true}
                          error={errorDate}
                        />
                        <button
                          className="btn btn-danger btn-sm m-2"
                          onClick={addFinPrevue}
                        >
                          Valider
                        </button>
                      </div>

                      {DateAPI.verifyDateExist(project.dateFinReelle) === "" ? (
                        <>
                          <div className="row no-space">
                            <h6 className="offset-sm-1 col-4">
                              Date de fin réélle :
                            </h6>
                            <p className="col-7">Aucune</p>
                          </div>
                          <div className="row no-space">
                            <h6 className="offset-sm-1 col-4">
                              Ajouter la date de fin réélle :
                            </h6>
                            <Field
                              name="dateFinReelle"
                              type="date"
                              onChange={handleChangeFinReelle}
                              value={DateAPI.formatDateForm(DateAPI.now())}
                              noLabel={true}
                              error={errorDateFinReelle}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="row no-space">
                            <h6 className="offset-sm-1 col-4">
                              Date de fin réélle :
                            </h6>
                            <p className="col-7">
                              {DateAPI.formatDate(project.dateFinReelle)}
                            </p>
                          </div>
                          <div className="row no-space">
                            <h6 className="offset-sm-1 col-4">
                              Modifier la date de fin réélle :
                            </h6>

                            <Field
                              name="dateFinReelle"
                              type="date"
                              onChange={handleChangeFinReelle}
                              value={DateAPI.formatDateForm(
                                project.dateFinReelle
                              )}
                              noLabel={true}
                              error={errorDateFinReelle}
                            />
                          </div>
                        </>
                      )}

                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Nom MOEX :</h6>
                        <Field
                          name="nomMOEX"
                          onChange={handleChange}
                          value={project.nomMOEX}
                          noLabel={true}
                        />
                      </div>

                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Nom OPC :</h6>
                        <Field
                          name="nomOPC"
                          onChange={handleChange}
                          value={project.nomOPC}
                          noLabel={true}
                        />
                      </div>

                      <div className="row no-space">
                        <h6 className="offset-sm-1 col-4">Contact client :</h6>
                        <Field
                          name="contactClient"
                          onChange={handleChange}
                          value={project.contactClient}
                          noLabel={true}
                        />
                      </div>

                      <div className="row mt-5">
                        <h6 className="offset-sm-1 col-4">Statut :</h6>
                        <p
                          className={
                            "col-2 badge badge-" +
                            determineStatusClasses(
                              project.dateDebut,
                              project.dateFinReelle
                            )
                          }
                        >
                          {determineStatusLabel(
                            project.dateDebut,
                            project.dateFinReelle
                          )}
                        </p>
                      </div>
                      <div className="row mt-4 d-flex justify-content-end mb-3">
                        <button
                          onSubmit={handleSubmit}
                          className="btn btn-danger"
                        >
                          Valider les changements
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
            <div className="mt-4 d-flex justify-content-center justify-content-lg-between flex-wrap mb-3">
              <Button
                text="Nouveau Rapport"
                className="btn btn-primary mx-2 mb-3"
                type="button"
                onClick={newReportClick}
              />
              <Link
                className="btn btn-primary mx-2 mb-3"
                type="button"
                to={"/project/" + project.id + "/listReports"}
              >
                Liste des rapports
              </Link>
              <Button
                text="Gérer les lots"
                className="btn btn-primary mx-2 mb-3"
                type="button"
                onClick={handleShowLotModal}
              />
              <Button
                text="Voir les échéances"
                className="btn btn-primary mx-2 mb-3"
                type="button"
                onClick={handleShowEcheanceModal}
              />

              {AuthAPI.isAdmin() && (
                <>
                  {!edit ? (
                    <Button
                      text="Modifier le projet"
                      className="btn btn-primary mx-2 mb-3"
                      type="button"
                      onClick={handleEditClick}
                    />
                  ) : (
                    <Button
                      text="Revenir aux détails du projet"
                      className="btn btn-info mx-2 mb-3"
                      type="button"
                      onClick={handleEditClick}
                    />
                  )}
                </>
              )}

              <Button
                text="Revenir à la liste"
                className="btn btn-danger md-mt-2 mx-2 mb-3"
                type="button"
                onClick={handleBackClick}
              />
            </div>
          </>
        ) : (
          <div id="loading-icon" />
        )}
      </div>

      {/* -------------------------------------------MODAL LOTS----------------------------------------------- */}

      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showLotModal}
        onHide={handleCloseLotModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Liste des lots</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {AuthAPI.isAdmin() && !addLot && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAddLot()}
            >
              Ajouter un lot
            </button>
          )}
          {!addLot && (
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Numéro de lot</th>
                  <th>Intitulé du lot</th>
                  <th>Entreprise</th>
                  <th>Contact</th>
                  {/* <th>Date de début</th>
                  <th>Date de fin</th> */}
                  <th />
                </tr>
              </thead>
              <tbody>
                {!loadingProject &&
                  project.lots.map((lot) => (
                    <tr key={lot.id}>
                      <td>{lot.numeroLot}</td>
                      <td>{lot.libelleLot}</td>
                      <td>{lot.company.nom}</td>
                      <td className="dropdown" data-toggle="dropdown">
                        {lot.annuaire && lot.annuaire.nom} &#11206;
                        <ul className="dropdown-menu">
                          {lot.annuaire.email && (
                            <li
                              className="dropdown-item"
                              onClick={handleClipboard}
                            >
                              Email: {lot.annuaire.email}
                            </li>
                          )}
                          {lot.annuaire.telephone && (
                            <li
                              className="dropdown-item"
                              onClick={handleClipboard}
                            >
                              Tel: {lot.annuaire.telephone}
                            </li>
                          )}
                        </ul>
                      </td>

                      {/* <td>{DateAPI.formatDate(lot.DateDebutEcheance)}</td>
                    <td>{DateAPI.formatDate(lot.dateFinEcheance)}</td> */}
                      <td></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {addLot && (
            <form onSubmit={handleSubmitLot}>
              <div className="d-flex justify-content-between">
                <div className="col-5">
                  <Field
                    className="m-auto"
                    name="numeroLot"
                    label="Numéro de Lot"
                    onChange={handleChangeLot}
                    value={lots.numeroLot}
                  />
                </div>
                <div className="col-5">
                  <Field
                    name="libelleLot"
                    label="Nom du Lot"
                    onChange={handleChangeLot}
                    value={lots.libelleLot}
                  />
                </div>
              </div>
              {/* <div className="d-flex justify-content-between">
                <div className="col-5">
                  <Field
                    name="DateDebutEcheance"
                    type="date"
                    label="Date de démarrage du Lot"
                    onChange={handleChangeLot}
                    value={DateAPI.formatDateForm(lots.DateDebutEcheance)}
                  />
                </div>
                <div className="col-5">
                  <Field
                    name="dateFinEcheance"
                    type="date"
                    label="Date de fin du Lot"
                    onChange={handleChangeLot}
                    value={DateAPI.formatDateForm(lots.dateFinEcheance)}
                  />
                </div>
              </div> */}
              <Select
                name="company"
                label="Entreprise"
                onChange={handleChangeLot}
                value={lots.company}
                error=""
              >
                {!lots.company && (
                  <option value="notSet">Selectionner une entreprise</option>
                )}
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nom}
                  </option>
                ))}
              </Select>
              {lots.company ? (
                <>
                  {companies.filter((company) => company.id == lots.company)[0]
                    .annuaires.length !== 0 ? (
                    <Select
                      name="annuaire"
                      label="Contact"
                      onChange={handleChangeLot}
                      value={lots.annuaire}
                      error=""
                    >
                      {!lots.annuaire && (
                        <option value="notSet">Selectionner un contact</option>
                      )}
                      {companies
                        .filter((company) => company.id == lots.company)[0]
                        .annuaires.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.nom}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <p>Aucun contact dans cette entreprise</p>
                  )}
                </>
              ) : (
                <p>Selectionnez une entreprise pour ajouter un contact</p>
              )}
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  onClick={() => handleCloseAddLot()}
                  className="btn btn-danger"
                >
                  Annuler
                </button>
                <button className="btn btn-success">Valider</button>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-danger" onClick={handleCloseLotModal}>
            Fermer
          </button>
          {/* <button className="btn btn-primary">Confirmer</button> */}
        </Modal.Footer>
      </Modal>
      {/* -------------------------------------------MODAL ÉCHÉANCES----------------------------------------------- */}

      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showEcheanceModal}
        onHide={handleCloseEcheanceModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Liste des Échéances</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {project.lots.map((lot) => (
            <React.Fragment key={lot.id}>
              {lot.echeances.length !== 0 && (
                <>
                  <div className="row justify-content-between">
                    <div className="mx-5">
                      Lot:{" "}
                      <h5>
                        {lot.numeroLot} {lot.libelleLot}
                      </h5>
                    </div>
                    <div className="mx-5">
                      Entreprise: <h5>{lot.company.nom}</h5>
                    </div>
                    <div className="mx-5">
                      Contact: <h5>{lot.annuaire.nom}</h5>
                    </div>
                  </div>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Rédacteur</th>
                        <th>Statut</th>
                        <th>Catégorie</th>
                        <th>Sujet</th>
                        <th>Début</th>
                        <th>Echéance</th>
                        <th>Clotûre</th>
                        <th>Retard</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lot.echeances.map((echeance) => (
                        <tr key={echeance.id}>
                          <td>{echeance.numeroEcheance}</td>
                          <td>{echeance.redacteur}</td>
                          <td>
                            <span
                              className={
                                "badge badge-" +
                                determineStatusClasses(
                                  echeance.dateDebut,
                                  echeance.dateCloture,
                                  echeance.dateFinPrevue
                                )
                              }
                            >
                              {determineStatusLabel(
                                echeance.dateDebut,
                                echeance.dateCloture,
                                echeance.dateFinPrevue
                              )}
                            </span>
                          </td>
                          <td>{echeance.categorie}</td>
                          <td>{echeance.sujet}</td>
                          <td>{DateAPI.formatDate(echeance.dateDebut)}</td>
                          <td>{DateAPI.formatDate(echeance.dateFinPrevue)}</td>
                          <td>{DateAPI.formatDate(echeance.dateCloture)}</td>
                          <td>
                            {DateAPI.retard(
                              echeance.dateCloture,
                              echeance.dateFinPrevue
                            ) > 0 &&
                              DateAPI.retard(
                                echeance.dateCloture,
                                echeance.dateFinPrevue
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr />
                </>
              )}
            </React.Fragment>
          ))}
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default DetailProjectPage;
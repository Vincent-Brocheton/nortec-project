import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Field from "./../components/forms/Field";
import FieldTextArea from "./../components/forms/FieldTextArea";
import UsersAPI from "../services/UsersAPI";
import ProjectsAPI from "../services/ProjectsAPI";
import DateAPI from "../services/DateAPI";
import { toast } from "react-toastify";
import "../../css/loading-icon.css";
import ImageUpload from "../components/forms/ImageUpload";
import MediaUploadAPI from "../services/MediaUploadAPI";
import pagination_configs, {
  ADMIN_PROJECT_PAGE_PAGINATION_ITEMS_PER_PAGE,
} from "../components/configs/pagination_configs";
import Pagination from "@material-ui/lab/Pagination";
import Modal from "react-bootstrap/Modal";
import { Button } from "@material-ui/core";
import Select from "../components/forms/Select";
import AuthAPI from "../services/AuthAPI";

const AdminProjectPage = ({ history, match, props }) => {
  const { id = "new" } = match.params;

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

  const [error, setError] = useState({
    name: "",
    description: "",
    photo: "",
    adresse1: "",
    adresse2: "",
    codePostal: "",
    dateDebut: "",
    dateFinReelle: "",
    nomMOEX: "",
    nomOPC: "",
    contactClient: "",
    ville: "",
    reports: "",
    users: "",
    lots: "",
    companies: "",
  });

  const [lots, setLots] = useState({
    numeroLot: "",
    libelleLot: "",
    DateDebutEcheance: "",
    dateFinEcheance: "",
    company: "",
    project: "",
  });

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [currentPageAddUser, setCurrentPageAddUser] = useState(1);
  const [currentPageRemUser, setCurrentPageRemUser] = useState(1);
  const [showLotModal, setShowLotModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [addLot, setAddLot] = useState(false);

  const [edit, setEdit] = useState(false);

  const [picture, setPicture] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await UsersAPI.findAll();
      setUsers(data);
      setLoadingUsers(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  const fetchProject = async (id) => {
    try {
      const data = await ProjectsAPI.find(id);
      setProject(data);
      setLoadingProject(false);
      // console.log(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const fetchCompany = async () => {
    try {
      const data = await ProjectsAPI.findAllCompany();
      setCompanies(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    if (id !== "new") {
      setEdit(true);
      fetchProject(id).then((r) => "");
      fetchUsers().then((r) => "");
    } else {
      fetchUsers().then((r) => "");
    }
  }, [id]);

  const filtredAdmin = users.filter(
    (user) => UsersAPI.determineRole(user) === "Administrateur"
  );

  const handleAddLot = () => {
    setAddLot(true);
  };

  // ----------------------------- Mise en place de la pagination ------------------------------------------

  const handleChangePageAddUser = (event, page) => {
    setCurrentPageAddUser(page);
  };

  const handleChangePageRemUser = (event, page) => {
    setCurrentPageRemUser(page);
  };

  const usersInProject = users.filter(
    (User) => User.project.indexOf("/api/projects/" + id) !== -1
  );
  const paginationConfigRemUser = pagination_configs.determinePaginationConfig(
    usersInProject,
    ADMIN_PROJECT_PAGE_PAGINATION_ITEMS_PER_PAGE,
    currentPageRemUser
  );

  const usersNotInProject = users.filter(
    (User) => User.project.indexOf("/api/projects/" + id) === -1
  );
  const paginationConfigAddUser = pagination_configs.determinePaginationConfig(
    usersNotInProject,
    ADMIN_PROJECT_PAGE_PAGINATION_ITEMS_PER_PAGE,
    currentPageAddUser
  );

  //----------------------------------- gestion de changement des input-----------------------------------
  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setProject({ ...project, [name]: value });
  };

  const handleChangeLot = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    setLots({ ...lots, [name]: value });
  };

  const handleAddUser = (user) => {
    const updatedUsers = [...project.users];
    updatedUsers.push(user);
    setProject({ ...project, users: updatedUsers });
  };

  const handleRemUser = (id) => {
    const updatedUsers = [...project.users];
    const index = updatedUsers.findIndex((user) => user.id === id);
    updatedUsers.splice(index, 1);
    setProject({ ...project, users: updatedUsers });
  };

  const handleCloseLotModal = () => {
    setShowLotModal(false);
    setAddLot(false);
  };

  const handleShowLotModal = () => {
    setShowLotModal(true);
    fetchCompany().then((r) => "");
  };

  const handleCloseUsersModal = () => {
    setShowUsersModal(false);
  };

  const handleShowUsersModal = () => {
    setShowUsersModal(true);
  };

  const handleCloseAddLot = () => {
    setAddLot(false);
  };

  const handleSubmitLot = async (event) => {
    event.preventDefault();

    console.log(lots.company);
    console.log(company);

    setAddLot(false);

    try {
      lots.project = "/api/projects/" + project.id;
      lots.company = "/api/companies/" + lots.company;

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData();
    data.append("file", picture[0]);

    if (!edit) {
      project.users = filtredAdmin.map((admin) => "/api/users/" + admin.id);
    }

    try {
      if (edit) {
        project.users = project.users.map(
          (userInProject) => "/api/users/" + userInProject.id
        );
        project.dateFinPrevues = project.dateFinPrevues.map(
          (dateInProject) => "/api/project_date_fin_prevues/" + dateInProject.id
        );
        project.lots = project.lots.map((lot) => "/api/lots/" + lot.id);
        // console.log(project.dateFinPrevues);
        await ProjectsAPI.update(id, project);
        toast.success("Le projet a bien été modifié !");
        await fetchProject(id);
        fetchUsers();
      } else {
        await MediaUploadAPI.upload(data)
          .then((response) => {
            console.log(response.data);
            project.photo = response.data.contentUrl;
          })
          .catch(function () {
            console.log("FAILURE");
          });
        await ProjectsAPI.create(project);
        toast.success("Le projet a bien été crée !");
        console.log(project);
        history.replace("/admin/project");
      }
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
  };

  //--------------------------------------------Gestion de l'image  ---------------------------------------------

  const onDrop = (picture) => {
    setPicture([...picture, picture]);
    console.log(picture);
  };

  //--------------------------------------------Template  --------------------------------------------------------

  return (
    <>
      <main className="container">
        {(edit && <h1>Modification du Projet</h1>) || (
          <h1>Création d'un Projet</h1>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="d-flex flex-wrap justify-content-between">
            <fieldset className="border-fieldset col-xl-6 col-12">
              <legend>Information de localisation</legend>
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
              <Field
                name="adresse1"
                label="Adresse 1"
                placeholder="Entrez le numéro et la rue"
                onChange={handleChange}
                value={project.adresse1}
                error={error.adresse1}
              />
              <Field
                name="adresse2"
                label="Adresse 2"
                placeholder="Entrez le complément d'adresse"
                onChange={handleChange}
                value={project.adresse2}
                error={error.adresse2}
              />
              <div className="d-flex justify-content-between">
                <Field
                  name="codePostal"
                  label="Code Postal"
                  placeholder="Entrez le Code Postal"
                  onChange={handleChange}
                  value={project.codePostal}
                  error={error.codePostal}
                />
                <Field
                  name="ville"
                  label="Ville"
                  placeholder="Entrez la ville"
                  onChange={handleChange}
                  value={project.ville}
                  error={error.ville}
                />
              </div>
              <ImageUpload singleImg={true} onChange={onDrop}></ImageUpload>
            </fieldset>
            <fieldset className="border-fieldset col-xl-5 col-125">
              <legend>Dates</legend>
              <Field
                name="dateDebut"
                label="Date de démarrage"
                type="date"
                onChange={handleChange}
                value={DateAPI.formatDateForm(project.dateDebut)}
                error={error.dateDebut}
              />
            </fieldset>
            <fieldset className="border-fieldset col-xl-6 col-12 center">
              <legend>Informations Client</legend>
              <Field
                name="nomMOEX"
                label="MOEX"
                onChange={handleChange}
                value={project.nomMOEX}
                error={error.nomMOEX}
              />
              <Field
                name="nomOPC"
                label="OPC"
                onChange={handleChange}
                value={project.nomOPC}
                error={error.nomOPC}
              />
              <Field
                name="contactClient"
                label="Contact du Client"
                type="email"
                onChange={handleChange}
                value={project.contactClient}
                error={error.contactClient}
              />

              {edit && (
                <button
                  type="button"
                  onClick={() => handleShowLotModal()}
                  className="btn btn-primary btn-sm"
                >
                  Voir les lots
                </button>
              )}
            </fieldset>
            <fieldset className="border-fieldset col-xl-5 col-12">
              <legend>Choix des utilisateurs</legend>
              {(edit && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleShowUsersModal()}
                    className="btn btn-primary btn-sm mb-4"
                  >
                    Ajouter des utilisateurs
                  </button>
                  {paginationConfigRemUser.paginatedItems.filter(
                    (User) => UsersAPI.determineRole(User) == "Administrateur"
                  ).length !== 0 && (
                    <table className="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th colSpan="3" className="text-center border-0">
                            Administrateurs
                          </th>
                        </tr>
                        <tr>
                          <th className="border-0">Prénom</th>
                          <th className="border-0">Nom</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginationConfigRemUser.paginatedItems
                          .filter(
                            (User) =>
                              UsersAPI.determineRole(User) == "Administrateur"
                          )
                          .map((user) => (
                            <tr key={user.id}>
                              <td className="w-35">{user.firstName}</td>
                              <td className="w-35">{user.lastName}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemUser(user.id)}
                                >
                                  Retirer
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                  {paginationConfigRemUser.paginatedItems.filter(
                    (User) => UsersAPI.determineRole(User) == "Utilisateur"
                  ).length !== 0 && (
                    <table className="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th colSpan="3" className="text-center border-0">
                            Utilisateurs
                          </th>
                        </tr>
                        <tr>
                          <th className="border-0">Prénom</th>
                          <th className="border-0">Nom</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginationConfigRemUser.paginatedItems
                          .filter(
                            (User) =>
                              UsersAPI.determineRole(User) == "Utilisateur"
                          )
                          .map((user) => (
                            <tr key={user.id}>
                              <td className="w-35">{user.firstName}</td>
                              <td className="w-35">{user.lastName}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemUser(user.id)}
                                >
                                  Retirer
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )) || (
                <div>
                  Veuillez créer votre projet avant de faire la modification des
                  utilisateurs
                </div>
              )}
              {edit && (
                <div className="mt-2 d-flex justify-content-center">
                  <Pagination
                    count={paginationConfigRemUser.pagesCount}
                    color="primary"
                    page={currentPageRemUser}
                    onChange={handleChangePageRemUser}
                  />
                </div>
              )}
            </fieldset>
          </div>
          <div className="form-group d-flex justify-content-between align-items-center mt-2">
            <Link to="/admin/project" className="btn btn-danger">
              Retour aux projets
            </Link>
            <button type="submit" className="btn btn-success">
              Valider
            </button>
          </div>
        </form>
      </main>

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
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {project.lots.map((lot) => (
                  <tr key={lot.id}>
                    <td>{lot.numeroLot}</td>
                    <td>{lot.libelleLot}</td>
                    <td>{!edit && lot.company.nom}</td>
                    <td>{DateAPI.formatDate(lot.DateDebutEcheance)}</td>
                    <td>{DateAPI.formatDate(lot.dateFinEcheance)}</td>
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
              <div className="d-flex justify-content-between">
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
              </div>
              <Select
                name="company"
                label="Entreprise"
                onChange={handleChangeLot}
                value={lots.company}
                error=""
              >
                <option value="notSet">Selectionner une entreprise</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nom}
                  </option>
                ))}
              </Select>
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
          <button className="btn btn-primary">Confirmer</button>
        </Modal.Footer>
      </Modal>

      {/* -------------------------------------------MODAL USERS----------------------------------------------- */}

      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showUsersModal}
        onHide={handleCloseUsersModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Liste des utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {paginationConfigAddUser.paginatedItems.filter(
              (User) => UsersAPI.determineRole(User) == "Administrateur"
            ).length !== 0 && (
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th colSpan="3" className="text-center border-0">
                      Administrateurs
                    </th>
                  </tr>
                  <tr>
                    <th className="border-0">Prénom</th>
                    <th className="border-0">Nom</th>
                  </tr>
                </thead>
                <tbody>
                  {paginationConfigAddUser.paginatedItems
                    .filter(
                      (User) => UsersAPI.determineRole(User) == "Administrateur"
                    )
                    .map((user) => (
                      <tr key={user.id}>
                        <td className="w-35">{user.firstName}</td>
                        <td className="w-35">{user.lastName}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddUser(user)}
                          >
                            Ajouter
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            {paginationConfigAddUser.paginatedItems.filter(
              (User) => UsersAPI.determineRole(User) == "Utilisateur"
            ).length !== 0 && (
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th colSpan="3" className="text-center border-0">
                      Utilisateurs
                    </th>
                  </tr>
                  <tr>
                    <th className="border-0">Prénom</th>
                    <th className="border-0">Nom</th>
                  </tr>
                </thead>
                <tbody>
                  {paginationConfigAddUser.paginatedItems
                    .filter(
                      (User) => UsersAPI.determineRole(User) == "Utilisateur"
                    )
                    .map((user) => (
                      <tr key={user.id}>
                        <td className="w-35">{user.firstName}</td>
                        <td className="w-35">{user.lastName}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddUser(user)}
                          >
                            Ajouter
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            <div className="mt-2 d-flex justify-content-center">
              <Pagination
                count={paginationConfigAddUser.pagesCount}
                color="primary"
                page={currentPageAddUser}
                onChange={handleChangePageAddUser}
              />
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminProjectPage;
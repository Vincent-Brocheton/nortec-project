import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import NavbarLeft from "../components/navbars/NavbarLeft";
import Button from "../components/forms/Button";
import FieldTextArea from "../components/forms/FieldTextArea";
import ImageUpload from "../components/forms/ImageUpload";
import Select from "../components/forms/Select";
import '../../css/app.css';
import {toast} from "react-toastify";
import fakeData from "../components/fakeDataForDev/fakeData";

const ReportSecuritePage = ({match}) => {

    const NavbarLeftWithRouter = withRouter(NavbarLeft);

    const [conforme, setConforme] = useState(null);
    const [entreprise, setEntreprise] = useState(null);

    const handleCheckConforme = () => {
        if (!conforme || conforme === false) {
            setConforme(true);
        }
    };

    const handleCheckNonConforme = () => {
        if (conforme || conforme === null) {
            setConforme(false);
        }
    };

    const handleSubmit = () => {

    };


    const [comment, setComment] = useState("");
    const [commentIntern, setCommentIntern] = useState("");
    const [imputations, setImputations] = useState("");

    const fetchReport = () => {

        setReport(reportById);
        //Vérification si édition ou nouveau rapport... Dans la version finale, le nouveau rapport existera mais avec valeurs vides donc pas de vérification à ce niveau
        if (reportById) {
            setConforme(reportById.security_conformity);
            setComment(reportById.security_comment);
            setCommentIntern(reportById.security_comment_intern);
            setImputations(reportById.security_comment_imputations);
        }

    };

    const urlParams = match.params;

    const reportById = fakeData.reportById(parseInt(urlParams.idReport, 10));

    const [report, setReport] = useState(reportById);

    useEffect(() => {
        //TODO Normalement charge le projet à chaque fois que l'id change. Attention plus tard vérifier que tout fonctionne avec axios
        fetchReport();

    }, []);

    const handleSubmitConform = () => {
        //TODO enregistrement de la conformité à true
        toast.success("Statut de sécurité enregistré avec succès!")
    };

    const handleChangeImputations = ({currentTarget}) => {
        const value = currentTarget.value;
        const name = currentTarget.name;

        setImputations({...imputations, [name]: value});
    };

    const handleChangeCommentIntern = ({currentTarget}) => {
        const value = currentTarget.value;

        setCommentIntern(value);
    };

    const handleChangeComment = ({currentTarget}) => {
        const value = currentTarget.value;

        setComment(value);

    };

    const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setEntreprise({...entreprise, [name]:value});
    };

    return (
        <main className="container">
            <NavbarLeftWithRouter selected='securite'/>

            <div className='page-content'>
                <div className='ml-2 mt-4 d-flex justify-content-between mb-3'>
                    <h2 className="mb-4">Sécurité :</h2>
                    <Button onClick={handleCheckConforme} className="btn btn-success mb-4" text="Conforme"
                            type="button"/>
                    <Button onClick={handleCheckNonConforme} className="btn btn-danger ml-5 mb-4" text="Non Conforme"
                            type="button"/>
                </div>

                {(conforme &&

                    <div className='card mt-3'>
                        <div className='row ml-2 d-flex justify-content-center mt-3'>
                            <h4 className='mb-4'>Sécurité conforme ?</h4>
                        </div>
                        <div className='row ml-2 d-flex justify-content-center'>
                            <Button onClick={handleSubmitConform} className="btn btn-info mb-4 row" text="Valider"
                                    type="button"/>
                        </div>
                    </div>

                )}
                {(conforme === false &&
                    <>
                        <div className="row">
                            <div>
                                {imputations.map(imputation =>

                                    <div className="row" key={imputation.id}>
                                        <h5 className="col-7">{imputation.company.nom}</h5>

                                        <FieldTextArea
                                            value={imputation.commentaire}
                                            className="form-control col-6 mb-1"
                                            name={"name" + imputation.company.id}
                                            onChange={handleChangeImputations}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="ml-auto">
                                <ImageUpload buttonText="Choisir l'image"/>
                            </div>
                        </div>
                            <div className="row">
                                <div className="col-6">
                                    <FieldTextArea label="Commentaire : " value={comment} placeholder="Commentaire pour toute les entreprises" onChange={handleChangeComment}/>
                                </div>
                                <div className="col-6">
                                    <FieldTextArea label="Commentaire interne : "
                                                   value={commentIntern}
                                                   placeholder="Commentaire pour toute les entreprises"
                                                    onChange={handleChangeCommentIntern}/>
                                </div>
                            </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default ReportSecuritePage;
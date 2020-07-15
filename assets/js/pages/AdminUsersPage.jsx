import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminUsersPage = ({history}) => {

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        Axios.get("http://localhost:8000/api/users").then(response => response.data['hydra:member']).then(data => setUsers(data));
    }, []);

    const handleDelete = async id => {

        const originalUsers = [...users];

        setUsers(users.filter(user => user.id !== id));

        try {
            await Axios.delete("http://localhost:8000/api/users/" + id);
            toast.success("L'utilisateur a bien été supprimé !");
        } catch (error) {
            setUsers(originalUsers);
            toast.error("L'utilisateur n'a pas été correctement supprimé !");
        }
        
    }

    const handleChangePage = page => {
        setCurrentPage(page);
    }

    const itemsPerPage = 8;
    const pagesCount = Math.ceil(users.length / itemsPerPage);
    const pages = [];

    for(let i=1 ; i<=pagesCount; i++){
        pages.push(i);
    }

    const start = currentPage * itemsPerPage - itemsPerPage;
    const paginatedUsers = users.slice(start, start + itemsPerPage)

    console.log(pages);

    return <main className="container">
        <div className="row">
        <h2 className="mb-4"> Utilisateurs : </h2>
        <Link
            className='btn btn-primary m-auto'
            type='button'
            to={'/newUser'}
        > Nouvel Utilisateur </Link>
        </div>
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {paginatedUsers.map(user =>
                <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.lastName} </td>
                    <td>{user.firstName} </td>
                    <td>{user.email} </td>
                    <td></td>
                    <td>
                        <button onClick={() => handleDelete(user.id)} className="btn btn-danger">Supprimer</button>
                    </td>
                </tr>
                    )}
            </tbody>
        </table>

        
        <div>
  <ul className="pagination pagination-sm">
    <li className={"page-item" + ( currentPage === 1 && " disabled")}>
      <button className="page-link" onClick={() => handleChangePage(currentPage - 1)}>&laquo;</button>
    </li>
    {pages.map(page => 
        <li key={page} className={"page-item" + ( currentPage === page && " active")}>
      <button className="page-link" onClick={() => handleChangePage(page)}>{page}</button>
    </li>
        )}
    
    <li className={"page-item" + ( currentPage === pagesCount && " disabled")}>
      <button className="page-link" onClick={() => handleChangePage(currentPage + 1)}>&raquo;</button>
    </li>
  </ul>
</div>
    </main>

};

export default AdminUsersPage;
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Stage not found</p>
      <button className="btn-arcade" onClick={() => navigate('/')}>
        Return
      </button>
    </div>
  );
}

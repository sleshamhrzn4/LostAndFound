import { useEffect, useState } from 'react';

function MyClaimsPage() {
    const [claims, setClaims] = useState([]);

    const fetchMyClaims = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/claims/mine', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                console.error('Failed to fetch claims:', err.message);
                setClaims([]);
                return;
            }
            const data = await res.json();
            setClaims(data);
        } catch (err) {
            console.error('Network error fetching claims:', err);
            setClaims([]);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, []);

    return (
        <div className="claims-container">
            <h2>My Claims</h2>
            {claims.map((claim) => (
                <div key={claim._id} className="claim-card">
                    <p>Item: {claim.itemId?.title}</p>
                    <p>Category: {claim.itemId?.category}</p>
                    <p>Message: {claim.message}</p>
                    <p>
                        Status:{' '}
                        <span className={`claim-status ${claim.status}`}>
                            {claim.status}
                        </span>
                    </p>
                </div>
            ))}
        </div>
    );
}

export default MyClaimsPage;
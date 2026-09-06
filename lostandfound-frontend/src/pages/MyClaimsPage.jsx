import { useEffect, useState } from "react";
import { API_BASE } from "../api";

function MyClaimsPage() {
    const [claims, setClaims] = useState([]);

    const fetchMyClaims = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/claims/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to fetch claims:", err.message);
                setClaims([]);
                return;
            }

            const data = await res.json();
            setClaims(data);
        } catch (err) {
            console.error("Network error fetching claims:", err);
            setClaims([]);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, []);

    return (
        <div className="claims-container">
            <div className="claims-heading">
                <span className="claims-kicker">Your activity</span>
                <h2>My Claims</h2>
                <p>Track the claims you have submitted and their current status.</p>
            </div>

            {claims.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <h3>No claims yet</h3>
                    <p>When you claim an item, it will appear here.</p>
                </div>
            ) : (
                <div className="claims-table">
                    <div className="claims-table-head">
                        <span>Item</span>
                        <span>Category</span>
                        <span>Message</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {claims.map((claim) => (
                        <div key={claim._id} className="claims-row">
                            <span className="claims-row-item">{claim.item?.title || "Item no longer exists"}</span>
                            <span className="claims-row-requester">{claim.item?.category || "—"}</span>
                            <span className="claims-row-message">{claim.message}</span>
                            <span>
                                <span className={`claim-status ${claim.status}`}>
                                    {claim.status}
                                </span>
                            </span>
                            <span></span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyClaimsPage;
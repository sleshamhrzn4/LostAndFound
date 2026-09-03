import { useEffect, useState } from "react";

function ClaimsPage() {
    const [claims, setClaims] = useState([]);

    const fetchClaims = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/claims", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to fetch claims:", err.message);
                return;
            }

            const data = await res.json();
            setClaims(data);
        } catch (err) {
            console.error("Network error fetching claims:", err);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleDecision = async (id, action) => {
        const token = localStorage.getItem("token");
        const status = action === "approve" ? "approved" : "rejected";

        try {
            const res = await fetch(`/api/claims/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to update claim:", err.message);
                return;
            }

            fetchClaims();
        } catch (err) {
            console.error("Network error updating claim:", err);
        }
    };

    return (
        <div className="claims-container">
            <h2>Pending Claims</h2>
            <p>Review submitted claims and decide whether they should be approved.</p>

            {claims.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <h3>No claims found</h3>
                    <p>There are currently no claim requests to review.</p>
                </div>
            )}

            {claims.map((claim) => (
                <div key={claim._id} className="claim-card">
                    <p>{claim.item?.title}</p>
                    <p>Requested by: {claim.requester?.email}</p>
                    <p>Message: {claim.message}</p>
                    <p>
                        Status:{" "}
                        <span className={`claim-status ${claim.status}`}>
                            {claim.status}
                        </span>
                    </p>

                    {claim.status === "pending" && (
                        <div className="form-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleDecision(claim._id, "approve")}
                            >
                                Approve
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDecision(claim._id, "reject")}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ClaimsPage;

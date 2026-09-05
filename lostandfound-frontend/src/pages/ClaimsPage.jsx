import { useEffect, useState } from "react";
import { API_BASE } from "../api";

function ClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/items`);
            if (!res.ok) return;
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Network error fetching items:", err);
        }
    };

    const fetchClaims = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/claims`, {
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
        fetchItems();
    }, []);

    const handleDecision = async (id, action) => {
        const token = localStorage.getItem("token");
        const status = action === "approve" ? "approved" : "rejected";

        try {
            const res = await fetch(`${API_BASE}/claims/${id}`, {
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

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this claim? This cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/claims/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to delete claim:", err.message);
                return;
            }

            fetchClaims();
        } catch (err) {
            console.error("Network error deleting claim:", err);
        }
    };

    return (
        <div className="claims-container">
            <div className="claims-heading">
                <span className="claims-kicker">Admin</span>
                <h2>Pending Claims</h2>
                <p>Review submitted claims and decide whether they should be approved.</p>
            </div>

            <section className="stats-grid" aria-label="Report statistics">
                <div className="stat-card">
                    <div className="stat-label">Reports shown</div>
                    <div className="stat-value">{items.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Lost reports</div>
                    <div className="stat-value">{items.filter((i) => i.type === "lost").length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Found reports</div>
                    <div className="stat-value">{items.filter((i) => i.type === "found").length}</div>
                </div>
            </section>

            {claims.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <h3>No claims found</h3>
                    <p>There are currently no claim requests to review.</p>
                </div>
            )}

            {claims.length > 0 && (
                <div className="claims-table">
                    <div className="claims-table-head">
                        <span>Item</span>
                        <span>Requester</span>
                        <span>Message</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {claims.map((claim) => (
                        <div key={claim._id} className="claims-row">
                            <span className="claims-row-item">{claim.item?.title || "Item no longer exists"}</span>
                            <span className="claims-row-requester">{claim.requester?.email || "Unknown user"}</span>
                            <span className="claims-row-message">{claim.message}</span>
                            <span>
                                <span className={`claim-status ${claim.status}`}>
                                    {claim.status}
                                </span>
                            </span>
                            <span className="claims-row-actions">
                                {claim.status === "pending" && (
                                    <>
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
                                    </>
                                )}
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(claim._id)}
                                >
                                    Delete
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClaimsPage;